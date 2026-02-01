import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { getLocalDate } from '../utils/dateUtils';

export const useFuel = () => {
    const [fuelRefills, setFuelRefills] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFuelRefills = async () => {
        try {
            const { data, error } = await supabase
                .from('fuel_refills')
                .select('*')
                .order('date', { ascending: false });

            if (!error && data) {
                setFuelRefills(data);
            }
        } catch (err) {
            console.error('Fetch fuel refills error:', err);
        } finally {
            setLoading(false);
        }
    };

    const addFuelRefill = async (refill) => {
        try {
            const { data, error } = await supabase
                .from('fuel_refills')
                .insert([{
                    date: refill.date || getLocalDate(),
                    amount: parseFloat(refill.amount) || 0,
                    notes: refill.notes || ''
                }])
                .select();

            if (!error && data) {
                setFuelRefills(prev => [data[0], ...prev]);
                return { success: true };
            }
            return { success: false, error };
        } catch (err) {
            return { success: false, error: err };
        }
    };

    const deleteFuelRefill = async (id) => {
        try {
            const { error } = await supabase
                .from('fuel_refills')
                .delete()
                .eq('id', id);

            if (!error) {
                setFuelRefills(prev => prev.filter(r => r.id !== id));
                return { success: true };
            }
            return { success: false, error };
        } catch (err) {
            return { success: false, error: err };
        }
    };

    useEffect(() => {
        fetchFuelRefills();

        // Add Real-time Subscription for Fuel Refills
        const fuelSubscription = supabase
            .channel('fuel_sync')
            .on('postgres_changes', { event: '*', table: 'fuel_refills' }, () => {
                fetchFuelRefills();
            })
            .subscribe();

        return () => {
            if (fuelSubscription) supabase.removeChannel(fuelSubscription);
        };
    }, []);

    return { fuelRefills, loading, addFuelRefill, deleteFuelRefill, fetchFuelRefills };
};
