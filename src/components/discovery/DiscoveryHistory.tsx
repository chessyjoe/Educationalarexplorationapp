/**
 * Discovery History Component
 * Displays user's saved discoveries with filtering and favorite options.
 */
import { useEffect, useState } from 'react';
import { discoveryAPI } from '@/services/apiService';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, Calendar, Star, Loader2, AlertCircle } from 'lucide-react';

interface Discovery {
    discovery_id: string;
    timestamp: string;
    subject_type: string;
    species_info: {
        common_name?: string;
        scientific_name?: string;
    };
    story: string;
    favorite: boolean;
    image_url?: string;
}

export function DiscoveryHistory() {
    const { user } = useAuth();
    const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'favorites'>('all');

    useEffect(() => {
        loadDiscoveries();
    }, [filter]);

    const loadDiscoveries = async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);

            const response: any = filter === 'favorites'
                ? await discoveryAPI.getFavorites()
                : await discoveryAPI.getHistory({ limit: 50 });

            setDiscoveries(filter === 'favorites' ? response.favorites : response.discoveries);
        } catch (err: any) {
            setError(err.message || 'Failed to load discoveries');
            console.error('Error loading discoveries:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleFavorite = async (discoveryId: string, currentFavorite: boolean) => {
        try {
            await discoveryAPI.toggleFavorite(discoveryId, !currentFavorite);

            // Update local state
            setDiscoveries(discoveries.map(d =>
                d.discovery_id === discoveryId
                    ? { ...d, favorite: !currentFavorite }
                    : d
            ));
        } catch (err) {
            console.error('Error toggling favorite:', err);
        }
    };

    if (!user) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">
                    Sign in to view your discovery history
                </p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading discoveries...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-12">
                <AlertCircle className="w-6 h-6 text-red-500 mr-2" />
                <span className="text-red-600 dark:text-red-400">{error}</span>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Your Discoveries
                </h1>

                {/* Filter buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'all'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                    >
                        All Discoveries ({discoveries.length})
                    </button>
                    <button
                        onClick={() => setFilter('favorites')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center ${filter === 'favorites'
                            ? 'bg-pink-600 text-white shadow-lg'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                    >
                        <Heart className="w-4 h-4 mr-2" />
                        Favorites
                    </button>
                </div>
            </div>

            {/* Discoveries grid */}
            {discoveries.length === 0 ? (
                <div className="text-center py-12">
                    <Star className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                        {filter === 'favorites'
                            ? 'No favorite discoveries yet. Heart some discoveries to see them here!'
                            : 'No discoveries yet. Start exploring and creating discoveries!'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {discoveries.map((discovery) => (
                        <div
                            key={discovery.discovery_id}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
                        >
                            {/* Image placeholder */}
                            <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 relative">
                                <button
                                    onClick={() => toggleFavorite(discovery.discovery_id, discovery.favorite)}
                                    className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-all"
                                >
                                    <Heart
                                        className={`w-5 h-5 ${discovery.favorite
                                            ? 'fill-pink-500 text-pink-500'
                                            : 'text-gray-600'
                                            }`}
                                    />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-5">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    {discovery.species_info.common_name || 'Unknown Discovery'}
                                </h3>

                                {discovery.species_info.scientific_name && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-3">
                                        {discovery.species_info.scientific_name}
                                    </p>
                                )}

                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    {new Date(discovery.timestamp).toLocaleDateString()}
                                </div>

                                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                                    {discovery.story}
                                </p>

                                <button className="mt-4 w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default DiscoveryHistory;
