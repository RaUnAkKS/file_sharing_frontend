import classNames from 'classnames';

const Button = ({ children, variant = 'primary', className, disabled, ...props }) => {
    const baseStyles = "btn";

    const variants = {
        primary: "btn-primary",
        secondary: "btn-secondary",
        danger: "btn-danger",
        ghost: "btn-icon"
    };

    return (
        <button
            className={classNames(baseStyles, variants[variant], className, { 'opacity-50 cursor-not-allowed': disabled })}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
