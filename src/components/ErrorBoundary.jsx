import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('CRITICAL APP ERROR:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ 
                    padding: '40px 20px', 
                    textAlign: 'center', 
                    background: '#fff', 
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{ color: '#e5484d', fontSize: '48px', marginBottom: '20px' }}>
                        ⚠️
                    </div>
                    <h1 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>
                        Something went wrong
                    </h1>
                    <p style={{ color: '#666', marginBottom: '20px', maxWidth: '300px' }}>
                        The application encountered an unexpected error and crashed.
                    </p>
                    <div style={{ 
                        background: '#f8f8f8', 
                        padding: '15px', 
                        borderRadius: '8px', 
                        fontSize: '12px', 
                        color: '#444', 
                        textAlign: 'left',
                        wordBreak: 'break-all',
                        fontFamily: 'monospace',
                        marginBottom: '20px'
                    }}>
                        {this.state.error?.message}
                    </div>
                    <button 
                        onClick={() => window.location.reload()}
                        style={{
                            background: '#9333ea',
                            color: '#fff',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            fontWeight: 'bold'
                        }}
                    >
                        Try Restarting App
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
