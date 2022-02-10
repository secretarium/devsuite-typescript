export const Navigation = () => {
    return <div className='flex flex-col h-full'>
        <iframe title='A' src='//localhost:4200/auth?r=A' className='h-full bg-slate-100' />
        <iframe title='B' src='//localhost:4200/auth?r=B' className='h-full bg-slate-200' />
    </div>;
};

export default Navigation;
