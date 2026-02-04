import classNames from 'classnames';

const Input = ({ label, error, className, icon, ...props }) => {
    return (
        <div className="w-full space-y-1">
            {label && <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>}
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        {icon}
                    </div>
                )}
                <input
                    className={classNames(
                        "w-full",
                        icon && "pl-10",
                        error && "border-red-500",
                        className
                    )}
                    {...props}
                />
            </div>
            {error && <span className="text-xs text-red-400 mt-1 block">{error}</span>}
        </div>
    );
};

export default Input;
