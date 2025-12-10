import React, { useEffect, useState } from 'react'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import Card from '../components/Card'
import SearchFilter from '../components/SearchFilter'
import { LoadingSpinner, ErrorMessage, EmptyState } from '../components/UIComponents'

export default function Home() {
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [foodCat, setFoodCat] = useState([]);
    const [foodItem, setFoodItem] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            let response = await fetch("https://bitebuddyy-project.onrender.com/api/foodData", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to load food data');
            }

            const data = await response.json();
            
            // Handle both old and new API response formats
            if (Array.isArray(data)) {
                setFoodItem(data[0] || []);
                setFoodCat(data[1] || []);
            } else if (data.foodItems && data.foodCategories) {
                setFoodItem(data.foodItems || []);
                setFoodCat(data.foodCategories || []);
            } else {
                throw new Error('Invalid data format');
            }
        } catch (err) {
            console.error('Error loading data:', err);
            setError(err.message || 'Failed to load food data. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    // Filter items based on search and category
    const getFilteredItems = () => {
        return foodItem.filter((item) => {
            const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = !categoryFilter || item.CategoryName === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    };

    const filteredItems = getFilteredItems();

    // Group filtered items by category
    const groupedByCategory = foodCat.reduce((acc, category) => {
        const itemsInCategory = filteredItems.filter(item => item.CategoryName === category.CategoryName);
        if (itemsInCategory.length > 0) {
            acc.push({
                ...category,
                items: itemsInCategory
            });
        }
        return acc;
    }, []);

    return (
        <div>
            <Navbar />
            
            {/* Carousel Section */}
            <div id="carouselExampleFade" className="carousel slide carousel-fade" data-bs-ride="carousel" style={{ objectFit: "contain !important" }}>
                <div className="carousel-inner" id='carousel'>
                    <div className="carousel-caption" style={{ zIndex: "10" }}>
                        <h1 className="display-6 mb-4 text-white">Welcome to BiteBuddy</h1>
                    </div>
                    <div className="carousel-item active">
                        <img src="https://source.unsplash.com/random/900×700/?burger" className="d-block w-100" style={{ filter: "brightness(30%)", maxHeight: "400px", objectFit: "cover" }} alt="Burgers" />
                    </div>
                    <div className="carousel-item">
                        <img src="https://source.unsplash.com/random/900×700/?pizza" className="d-block w-100" style={{ filter: "brightness(30%)", maxHeight: "400px", objectFit: "cover" }} alt="Pizza" />
                    </div>
                    <div className="carousel-item">
                        <img src="https://source.unsplash.com/random/900×700/?salad" className="d-block w-100" style={{ filter: "brightness(30%)", maxHeight: "400px", objectFit: "cover" }} alt="Salad" />
                    </div>
                </div>
                <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleFade" data-bs-slide="prev">
                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleFade" data-bs-slide="next">
                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Next</span>
                </button>
            </div>

            {/* Main Content */}
            <div className='container mt-5'>
                {error && (
                    <ErrorMessage 
                        message={error}
                        onDismiss={() => setError(null)}
                    />
                )}

                {/* Search and Filter */}
                <SearchFilter 
                    onSearch={setSearch}
                    onCategoryFilter={setCategoryFilter}
                    categories={foodCat}
                    placeholder="Search for your favorite food..."
                />

                {/* Loading State */}
                {loading && <LoadingSpinner fullScreen={true} />}

                {/* Empty State */}
                {!loading && filteredItems.length === 0 && (
                    <EmptyState 
                        title="No food items found"
                        message="Try adjusting your search or filter criteria."
                    />
                )}

                {/* Food Items by Category */}
                {!loading && groupedByCategory.length > 0 && (
                    <div>
                        {groupedByCategory.map((category) => (
                            <div key={category._id} className='mb-5'>
                                <div className="fs-3 m-3 fw-bold text-success">
                                    {category.CategoryName}
                                </div>
                                <hr />
                                <div className='row g-3'>
                                    {category.items.map(filterItems => (
                                        <div key={filterItems._id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                                            <Card 
                                                foodItem={filterItems}
                                                options={filterItems.options[0]}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    )
}
