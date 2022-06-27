import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';

import { useUserActions, useAlertActions } from '../_actions';

export { Register };

function Register() {
    const userActions = useUserActions();
    const alertActions = useAlertActions();
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
            .required('Password is required')
            .min(6, 'Password must be at least 6 characters')
    });
    const formOptions = { resolver: yupResolver(validationSchema) };

    // get functions to build form with useForm() hook
    const { register, handleSubmit, formState } = useForm(formOptions);
    const { errors, isSubmitting } = formState;

    function onSubmit(data: Record<string, any>) {
        return userActions.register(data)
            .then(() => {
                navigate('/account/login');
                alertActions.success('Registration successful');
            });
    }

    return (
        <div className="card m-3">
            <h4 className="card-header">Register</h4>
            <div className="card-body">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-group">
                        <label>First Name</label>
                        <input title="firstName" type="text" {...register('firstName')} className={`form-control ${errors['firstName'] ? 'is-invalid' : ''}`} />
                        <div className="invalid-feedback">{errors['firstName']?.message?.toString()}</div>
                    </div>
                    <div className="form-group">
                        <label>Last Name</label>
                        <input title="lastName" type="text" {...register('lastName')} className={`form-control ${errors['lastName'] ? 'is-invalid' : ''}`} />
                        <div className="invalid-feedback">{errors['lastName']?.message?.toString()}</div>
                    </div>
                    <div className="form-group">
                        <label>Username</label>
                        <input title="username" type="text" {...register('username')} className={`form-control ${errors['username'] ? 'is-invalid' : ''}`} />
                        <div className="invalid-feedback">{errors['username']?.message?.toString()}</div>
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input title="password" type="password" {...register('password')} className={`form-control ${errors['password'] ? 'is-invalid' : ''}`} />
                        <div className="invalid-feedback">{errors['password']?.message?.toString()}</div>
                    </div>
                    <button disabled={isSubmitting} className="btn btn-primary">
                        {isSubmitting && <span className="spinner-border spinner-border-sm mr-1"></span>}
                        Register
                    </button>
                    <Link to="login" className="btn btn-link">Cancel</Link>
                </form>
            </div>
        </div>
    );
}