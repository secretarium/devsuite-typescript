import logo from '~/images/secretarium.svg';

export default () => {
    return <img
        src={logo}
        alt="Secretarium"
        className="mx-auto m-6 w-full max-w-[3rem] md:max-w-[3rem]"
    />;
};