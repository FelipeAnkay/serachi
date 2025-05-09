import React, { useEffect, useState } from 'react';
import { useProductServices } from '../store/productServices';
import { CircleCheck } from 'lucide-react';

export default function ProductList({ store }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { getProductByStoreId, getProductById, removeProduct, updateProduct, createProduct } = useProductServices();
    const [selectedProductIds, setSelectedProductIds] = useState([]);
    const [finalPrice, setFinalPrice] = useState();
    console.log("Final Price: ", finalPrice);
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await getProductByStoreId(store);
                console.log("ProductList Response: ", response);
                setProducts(response.productList);
                setLoading(false);
                console.log("ProductList: ", products);
            } catch (error) {
                console.error('Error fetching products:', error);
                setLoading(false);
            }
        }
        if (store) {
            fetchProducts();
        }
    }, []);

    const handleProductSelected = (productId) => {
        setSelectedProductIds((prevSelected) => {
          let updatedSelected;
          if (prevSelected.includes(productId)) {
            // Deseleccionar
            updatedSelected = prevSelected.filter((id) => id !== productId);
          } else {
            // Seleccionar
            updatedSelected = [...prevSelected, productId];
          }
      
          // Actualiza el precio total
          const total = updatedSelected.reduce((sum, id) => {
            const product = products.find((p) => p._id === id);
            return sum + (product?.price || 0);
          }, 0);
          setFinalPrice(total);
      
          return updatedSelected;
        });
      };

    if (loading) return <p className="text-center">Loading products...</p>;

    return (
        <div className="p-6 space-y-4">
            <h2 className="text-2xl font-bold">Product List</h2>
            {products.length === 0 ? (
                <p>No products found for this store.</p>
            ) : (

                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ml-3 mr-3 mb-3">
                    {products.map((product) => {
                        const isSelected = selectedProductIds.includes(product._id);

                        return (
                            <div
                                key={product._id}
                                className={`border rounded-lg p-4 cursor-pointer bg-white hover:shadow transition relative ${isSelected ? 'border-green-500' : 'border-gray-300'
                                    }`}
                                onClick={() => handleProductSelected(product._id)}
                            >
                                <h3 className="text-lg font-semibold">{product.name}</h3>
                                <p className="text-sm text-gray-600">Price: ${product.price}</p>
                                <p className="text-sm text-gray-600">Duration: {product.durationDays} days</p>
                                {isSelected && (
                                    <CircleCheck className="absolute top-2 right-2 text-green-600" />
                                )}
                            </div>
                        );
                    })}
                </div>
            )};
        </div>
    )
}