import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/')({
    component: Index
});

function Index() {
    return (
        <div className="p-2 text-2xl">
            <h3>Welcome Home!</h3>
        </div>
    );
}

if (import.meta.vitest) {
    const { it, expect, beforeEach } = import.meta.vitest;
    let render: typeof import('@testing-library/react').render;

    beforeEach(async () => {
        render = (await import('@testing-library/react')).render;
    });

    it('should render successfully', () => {
        const { baseElement } = render(<Index />);
        expect(baseElement).toBeTruthy();
    });

    it('should have a greeting as the title', () => {
        const { getByText } = render(<Index />);
        expect(getByText(/Welcome Home/gi)).toBeTruthy();
    });
}