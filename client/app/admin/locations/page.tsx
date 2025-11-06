"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dropdown } from "@/components/ui/dropdown";
import { Search, Edit, Trash2, Plus } from "lucide-react";

interface Location {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    category: string | null;
    createdAt: string;
}

const LocationsPage = () => {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [locations, setLocations] = useState<Location[]>([]);
    const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        if (isLoaded && user) {
            fetchLocations();
        } else if (isLoaded && !user) {
            router.push("/sign-in");
        }
    }, [isLoaded, user, router]);

    useEffect(() => {
        let filtered = locations;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(
                (location) =>
                    location.name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    (location.description &&
                        location.description
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())),
            );
        }

        // Filter by category
        if (selectedCategory !== "all") {
            filtered = filtered.filter(
                (location) => location.category === selectedCategory,
            );
        }

        setFilteredLocations(filtered);
    }, [locations, searchTerm, selectedCategory]);

    const fetchLocations = async () => {
        try {
            const response = await fetch("/api/admin/locations");
            if (response.ok) {
                const data = await response.json();
                setLocations(data.locations);
            }
        } catch (error) {
            console.error("Failed to fetch locations:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteLocation = async (locationId: string) => {
        if (
            !confirm(
                "Are you sure you want to delete this location? This action cannot be undone.",
            )
        ) {
            return;
        }

        setDeletingId(locationId);
        try {
            const response = await fetch(`/api/admin/locations/${locationId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                // Refresh the locations list
                await fetchLocations();
            } else {
                console.error("Failed to delete location");
            }
        } catch (error) {
            console.error("Error deleting location:", error);
        } finally {
            setDeletingId(null);
        }
    };

    const getCategoryColor = (category: string | null) => {
        switch (category) {
            case "city":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "natural":
                return "bg-green-100 text-green-800 border-green-200";
            case "cultural":
                return "bg-purple-100 text-purple-800 border-purple-200";
            case "adventure":
                return "bg-orange-100 text-orange-800 border-orange-200";
            case "unique":
                return "bg-pink-100 text-pink-800 border-pink-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getCategoryLabel = (category: string | null) => {
        switch (category) {
            case "city":
                return "City";
            case "natural":
                return "Natural";
            case "cultural":
                return "Cultural";
            case "adventure":
                return "Adventure";
            case "unique":
                return "Unique";
            default:
                return "Other";
        }
    };

    const categories = [
        { value: "all", label: "All Categories" },
        { value: "city", label: "Cities" },
        { value: "natural", label: "Natural Wonders" },
        { value: "cultural", label: "Cultural Sites" },
        { value: "adventure", label: "Adventure" },
        { value: "unique", label: "Unique Experiences" },
    ];

    if (!isLoaded) {
        return (
            <div className="max-w-7xl mx-auto px-20 py-16">
                <div className="text-center">
                    <p className="body-1 text-tertiary-300">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect to sign-in
    }

    return (
        <div className="space-y-4 sm:space-y-8 p-3 sm:p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                <div>
                    <h1 className="heading-3 sm:heading-1 text-tertiary-500">
                        Manage Locations
                    </h1>
                    <p className="body-3 sm:body-1 text-tertiary-300 mt-1 sm:mt-2">
                        View and manage all travel locations available for BINGO
                        games
                    </p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => router.push("/admin/locations/create")}
                    className="px-4 py-2 sm:px-8 sm:py-3 w-full sm:w-auto"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Location
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-3 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                type="search"
                                placeholder="Search locations..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                icon={<Search className="w-4 h-4" />}
                            />
                        </div>
                        <div className="sm:w-48">
                            <Dropdown
                                value={selectedCategory}
                                onValueChange={setSelectedCategory}
                                options={categories}
                                placeholder="All Categories"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Locations List */}
            <div className="space-y-3 sm:space-y-6">
                <div className="flex items-center justify-between px-1 sm:px-0">
                    <h2 className="heading-4 sm:heading-3 text-tertiary-500">
                        Locations ({filteredLocations.length})
                    </h2>
                </div>

                {isLoading ? (
                    <div className="text-center py-6 sm:py-8">
                        <p className="body-2 sm:body-1 text-tertiary-300">
                            Loading locations...
                        </p>
                    </div>
                ) : filteredLocations.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-8 sm:py-12 p-4 sm:p-6">
                            <p className="body-1 text-tertiary-300 mb-4">
                                {locations.length === 0
                                    ? "No locations found. Create your first location to get started!"
                                    : "No locations match your search criteria."}
                            </p>
                            {locations.length === 0 && (
                                <Button
                                    variant="primary"
                                    onClick={() =>
                                        router.push("/admin/locations/create")
                                    }
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Location
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredLocations.map((location) => (
                            <Card
                                key={location.id}
                                className="hover:shadow-md transition-shadow"
                            >
                                <CardContent className="p-4 sm:p-6">
                                    <div className="space-y-4">
                                        {/* Location Image */}
                                        {location.imageUrl && (
                                            <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                                                <Image
                                                    src={location.imageUrl}
                                                    alt={location.name}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    className="object-cover"
                                                    unoptimized
                                                    onError={(e) => {
                                                        (
                                                            e.currentTarget as HTMLImageElement
                                                        ).style.display =
                                                            "none";
                                                    }}
                                                />
                                            </div>
                                        )}

                                        {/* Location Info */}
                                        <div>
                                            <h3 className="heading-4 text-tertiary-500 mb-2">
                                                {location.name}
                                            </h3>
                                            {location.description && (
                                                <p className="body-3 text-tertiary-300 mb-3 line-clamp-2">
                                                    {location.description}
                                                </p>
                                            )}
                                            <Badge
                                                className={getCategoryColor(
                                                    location.category,
                                                )}
                                            >
                                                {getCategoryLabel(
                                                    location.category,
                                                )}
                                            </Badge>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    router.push(
                                                        `/admin/locations/${location.id}`,
                                                    )
                                                }
                                                className="flex-1"
                                            >
                                                <Edit className="w-4 h-4 mr-2" />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() =>
                                                    handleDeleteLocation(
                                                        location.id,
                                                    )
                                                }
                                                disabled={
                                                    deletingId === location.id
                                                }
                                                className="px-3"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LocationsPage;
