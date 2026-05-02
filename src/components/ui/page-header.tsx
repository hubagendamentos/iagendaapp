type PageHeaderProps = {
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
};

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
    return (
        <div className="mb-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">
                    {title}
                </h1>

                {actions && (
                    <div className="flex items-center gap-2">
                        {actions}
                    </div>
                )}
            </div>

            {subtitle && (
                <p className="mt-1 text-sm text-muted-foreground">
                    {subtitle}
                </p>
            )}
        </div>
    );
}