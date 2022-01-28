import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate, useParams } from 'react-router';
import type { RouteProps } from 'react-router';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { useRecoilValue } from 'recoil';

import { userAtom } from '../_state';
import { useUserActions, useAlertActions } from '../_actions';

export { AddEdit };

const AddEdit: React.FC<RouteProps> = () => {
    const { id } = useParams();
    const mode = { add: !id, edit: !!id };
    const userActions = useUserActions();
    const alertActions = useAlertActions();
    const user = useRecoilValue(userAtom);
    const navigate = useNavigate();

    // form validation rules
    const validationSchema = Yup.object().shape({
        firstName: Yup.string()
            .required('First Name is required'),
        lastName: Yup.string()
            .required('Last Name is required'),
        username: Yup.string()
            .required('Username is required'),
        password: Yup.string()
            .transform(x => x === '' ? undefined : x)
            .concat(mode?.add ? Yup.string().required('Password is required') : null as any)
            .min(6, 'Password must be at least 6 characters')
    });
    const formOptions = { resolver: yupResolver(validationSchema) };

    // get functions to build form with useForm() hook
    const { register, handleSubmit, reset, formState } = useForm(formOptions);
    const { errors, isSubmitting } = formState;

    useEffect(() => {
        // fetch user details into recoil state in edit mode
        if (mode.edit && id) {
            userActions.getById(id);
        }

        return userActions.resetUser;

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // set default form values after user set in recoil state (in edit mode)
        if (mode.edit && user) {
            reset(user);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    function onSubmit(data: Record<string, string>) {
        return mode.add
            ? createUser(data)
            : user ? updateUser(user.id, data) : null;
    }

    function createUser(data: Record<string, string>) {
        return userActions.register(data)
            .then(() => {
                navigate('/users');
                alertActions.success('User added');
            });
    }

    function updateUser(id: string, data: Record<string, string>) {
        return userActions.update(id, data)
            .then(() => {
                navigate('/users');
                alertActions.success('User updated');
            });
    }

    const loading = mode.edit && !user;
    return (
        <>
            <h1>{mode.add ? 'Add User' : 'Edit User'}</h1>
            {!loading &&
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-row">
                        <div className="form-group col">
                            <label>First Name</label>
                            <input title="firstName" type="text" {...register('firstName')} className={`form-control ${errors['firstName'] ? 'is-invalid' : ''}`} />
                            <div className="invalid-feedback">{errors['firstName']?.message}</div>
                        </div>
                        <div className="form-group col">
                            <label>Last Name</label>
                            <input title="lastName" type="text" {...register('lastName')} className={`form-control ${errors['lastName'] ? 'is-invalid' : ''}`} />
                            <div className="invalid-feedback">{errors['lastName']?.message}</div>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group col">
                            <label>Username</label>
                            <input title="username" type="text" {...register('username')} className={`form-control ${errors['username'] ? 'is-invalid' : ''}`} />
                            <div className="invalid-feedback">{errors['email']?.message}</div>
                        </div>
                        <div className="form-group col">
                            <label>
                                Password
                                {mode.edit && <em className="ml-1">(Leave blank to keep the same password)</em>}
                            </label>
                            <input title="password" type="password" {...register('password')} className={`form-control ${errors['password'] ? 'is-invalid' : ''}`} />
                            <div className="invalid-feedback">{errors['password']?.message}</div>
                        </div>
                    </div>
                    <div className="form-group">
                        <button type="submit" disabled={isSubmitting} className="btn btn-primary mr-2">
                            {isSubmitting && <span className="spinner-border spinner-border-sm mr-1"></span>}
                            Save
                        </button>
                        <button onClick={() => user && reset(user)} type="button" disabled={isSubmitting} className="btn btn-secondary">Reset</button>
                        <Link to="/users" className="btn btn-link">Cancel</Link>
                    </div>
                </form>
            }
            {loading &&
                <div className="text-center p-3">
                    <span className="spinner-border spinner-border-lg align-center"></span>
                </div>
            }
        </>
    );
};