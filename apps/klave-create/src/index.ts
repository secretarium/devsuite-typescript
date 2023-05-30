import spawnAsync from '@expo/spawn-async';
import chalk from 'chalk';
import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import prompts from 'prompts';
import { replaceInFile } from 'replace-in-file';
import { getSlugPrompt, getSubstitutionDataPrompts } from './lib/prompts';
import {
    PackageManagerName,
    resolvePackageManager
} from './lib/resolvePackageManager';
import type { CommandOptions, SubstitutionData } from './lib/types';
import { newStep } from './lib/utils';
import packageJson from '../package.json';
import latestVersion from 'latest-version';

// `yarn run` may change the current working dir, then we should use `INIT_CWD` env.
const CWD = process.env.INIT_CWD || process.cwd();

// Docs URL
const DOCS_URL = 'https://klave.network';

/**
 * The main function of the command.
 *
 * @param target Path to the directory where to create the module. Defaults to current working dir.
 * @param command An object from `commander`.
 */
async function main(target: string | undefined, options: CommandOptions) {
    const slug = await askForPackageSlugAsync(target);
    const targetDir = path.join(CWD, target || slug);

    await fs.ensureDir(targetDir);
    await confirmTargetDirAsync(targetDir);

    options.target = targetDir;

    const data = await askForSubstitutionDataAsync(slug);
    // await askForSubstitutionDataAsync(slug);

    // Make one line break between prompts and progress logs
    console.log();

    const packageManager = await resolvePackageManager();
    const packagePath = options.source
        ? path.join(CWD, options.source)
        // : await downloadPackageAsync(targetDir);
        : await createTemplateAsync(targetDir, data);

    await newStep('Installing dependencies', async (step) => {
        try {
            await spawnAsync('yarn', [], {
                cwd: targetDir,
                stdio: 'ignore'
            });
            step.succeed('Installing dependencies');
        } catch (e: any) {
            step.fail(e.toString());
        }
    });

    await newStep('Creating an empty Git repository', async (step) => {
        try {
            await spawnAsync('git', ['init'], {
                cwd: targetDir,
                stdio: 'ignore'
            });
            step.succeed('Created an empty Git repository');
        } catch (e: any) {
            step.fail(e.toString());
        }
    });

    if (!options.source) {
        // Files in the downloaded tarball are wrapped in `package` dir.
        // We should remove it after all.
        await fs.remove(packagePath);
    }
    if (!options.withReadme) {
        await fs.remove(path.join(targetDir, 'README.md'));
    }
    if (!options.withChangelog) {
        await fs.remove(path.join(targetDir, 'CHANGELOG.md'));
    }

    console.log();
    console.log('✅ Successfully created a Trustless application');

    printFurtherInstructions(targetDir, packageManager, options.example);
}

/**
 * Create template files.
 */
async function createTemplateAsync(targetDir: string, data: SubstitutionData): Promise<string> {
    return await newStep('Creating template files', async (step) => {

        await fs.copy(path.join(__dirname, '..', 'template', '**/*'), targetDir, {
            filter: () => true
        });

        await fs.copy(path.join(__dirname, '..', 'template', '.*'), targetDir, {
            filter: () => true
        });

        await replaceInFile({
            files: path.join(targetDir, 'klave.json'),
            from: [/{{SMART_CONTRACT_NAME}}/g, /{{SMART_CONTRACT_SLUG}}/g],
            to: [data.project.name, data.project.slug]
        });

        const latestSDK = await latestVersion('@klave/sdk');
        await replaceInFile({
            files: path.join(targetDir, 'package.json'),
            from: [/{{KLAVE_SDK_CURRENT_VERSION}}/g],
            to: [latestSDK ?? '*']
        });

        step.succeed('Creating template files');

        return path.join(targetDir, 'package');
    });
}

/**
 * Asks the user for the package slug (npm package name).
 */
async function askForPackageSlugAsync(customTargetPath?: string): Promise<string> {
    const { slug } = await prompts(getSlugPrompt(customTargetPath), {
        onCancel: () => process.exit(0)
    });
    return slug;
}

/**
 * Asks the user for some data necessary to render the template.
 * Some values may already be provided by command options, the prompt is skipped in that case.
 */
async function askForSubstitutionDataAsync(slug: string): Promise<SubstitutionData> {
    const promptQueries = await getSubstitutionDataPrompts(slug);

    // Stop the process when the user cancels/exits the prompt.
    const onCancel = () => {
        process.exit(0);
    };

    const {
        name,
        description,
        package: projectPackage,
        authorName,
        authorEmail,
        authorUrl,
        repo
    } = await prompts(promptQueries, { onCancel });

    return {
        project: {
            slug,
            name,
            version: '0.1.0',
            description,
            package: projectPackage
        },
        author: `${authorName} <${authorEmail}> (${authorUrl})`,
        license: 'MIT',
        repo
    };
}

/**
 * Checks whether the target directory is empty and if not, asks the user to confirm if he wants to continue.
 */
async function confirmTargetDirAsync(targetDir: string): Promise<void> {
    const files = await fs.readdir(targetDir);

    if (files.length === 0) {
        return;
    }
    const { shouldContinue } = await prompts(
        {
            type: 'confirm',
            name: 'shouldContinue',
            message: `The target directory ${chalk.magenta(
                targetDir
            )} is not empty, do you want to continue anyway?`,
            initial: true
        },
        {
            onCancel: () => false
        }
    );
    if (!shouldContinue) {
        process.exit(0);
    }
}

/**
 * Prints how the user can follow up once the script finishes creating the module.
 */
function printFurtherInstructions(
    targetDir: string,
    __unusedPackageManager: PackageManagerName,
    includesExample: boolean
) {
    if (includesExample) {
        const commands = [
            `cd ${path.relative(CWD, targetDir)}`,
            'code .'
        ];

        console.log();
        console.log(
            'To start developing your trustless application, navigate to the directory and open your favorite editor'
        );
        commands.forEach((command) => console.log(chalk.gray('>'), chalk.bold(command)));
        console.log();
    }
    console.log(`Visit ${chalk.blue.bold(DOCS_URL)} for the documentation on the Klave Network`);
}

const program = new Command();

program
    .name(packageJson.name)
    .version(packageJson.version)
    .description(packageJson.description)
    .arguments('[path]')
    .action(main);

program.parse(process.argv);