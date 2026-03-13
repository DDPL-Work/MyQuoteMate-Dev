// admin/src/pages/UsersPage.jsx
import React, { useState, useEffect } from 'react';
import { Users, Loader2 } from 'lucide-react';
import api from '../services/api';
import UsersTable from '../components/UsersTable';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

    useEffect(() => {
        fetchUsers(1);
    }, []);

    const fetchUsers = async (page = 1) => {
        try {
            setLoading(true);
            const response = await api.get('/admin/users', {
                params: { page, limit: 10 }
            });
            setUsers(response.data.data);
            setPagination(response.data.pagination || { page, limit: 10, total: response.data.data.length });
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-8 h-8 text-orange-500" />
                    User Management
                </h1>
                <p className="text-gray-600 mt-2">Manage and monitor all platform users</p>
            </div>

            <UsersTable
                users={users}
                loading={loading}
                pagination={pagination}
                onPageChange={fetchUsers}
            />
        </div>
    );
};

export default UsersPage;
