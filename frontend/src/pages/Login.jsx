import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, clearError } from '../features/auth/authSlice';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Loader2 } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student'); // Default role
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated && user) {
            // Redirect based on role
            if (user.role === 'super_admin') navigate('/super-admin');
            else if (user.role === 'admin') navigate('/admin');
            else if (user.role === 'teacher') navigate('/teacher');
            else navigate('/student');
        }
    }, [isAuthenticated, user, navigate]);

    useEffect(() => {
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(login({ email, password, role }));
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
                    <CardDescription className="text-center">
                        Enter your credentials to access your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* <div className="space-y-2">
                            <Label htmlFor="role">Select Role</Label>
                            <select
                                id="role"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                            >
                                <option value="student">Student</option>
                                <option value="teacher">Teacher</option>
                                <option value="admin">Admin</option>
                                <option value="super_admin">Super Admin</option>
                            </select>
                        </div> */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sign In'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                    <p className="text-sm text-muted-foreground">
                        Forgot your password? Contact administration.
                    </p>
                    {/* <div className="text-xs text-muted-foreground border-t pt-2 w-full">
                        <p className="font-semibold mb-1">Demo Credentials:</p>
                        <p>Admin: admin@demo.com / admin123</p>
                        <p>Teacher: teacher1@demo.com / teacher123</p>
                        <p>Student: student1@demo.com / student123</p>
                    </div> */}
                </CardFooter>
            </Card>
        </div>
    );
};

export default Login;
