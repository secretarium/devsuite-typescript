import { Route, Routes } from 'react-router-dom';
import { List, AddEdit } from './';

export { Users };

function Users() {

    return (
        <div className="p-4">
            <div className="container">
                <Routes>
                    <Route path="/" element={<List />} />
                    <Route path='add' element={<AddEdit />} />
                    <Route path='edit/:id' element={<AddEdit />} />
                </Routes>
            </div>
        </div>
    );
}