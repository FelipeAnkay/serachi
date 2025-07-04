import { Trash2 } from 'lucide-react';
import Select from 'react-select';

const ProductSelectForm = ({ products, value = [], onChange }) => {
  const handleSelect = (selectedOption) => {
    if (!selectedOption) return;

    const already = value.find((item) => item.productId === selectedOption.value);
    if (already) return;

    const product = selectedOption.product;
    const newItem = {
      productId: product._id,
      productName: product.name,
      Qty: 1,
      productUnitaryPrice: product.finalPrice || 0,
      productFinalPrice: product.finalPrice || 0,
    };

    onChange([...value, newItem]);
  };

  const updateField = (index, field, val) => {
    const updated = [...value];
    updated[index] = {
      ...updated[index],
      [field]: field === "Qty" || field.includes("Price") ? parseFloat(val) : val,
    };
    if (field === "Qty" || field === "productUnitaryPrice") {
      updated[index].productFinalPrice = updated[index].Qty * updated[index].productUnitaryPrice;
    }
    console.log("El producto actualizado es: ", updated)
    onChange(updated);
  };

  const removeItem = (index) => {
    const updated = [...value];
    updated.splice(index, 1);
    onChange(updated);
  };

  const availableOptions = products
    .filter((p) => !value.find((v) => v.productId === p._id))
    .map((p) => ({
      value: p._id,
      label: `${p.name} ($${p.finalPrice})`,
      product: p,
    }));

  return (
    <div className="space-y-4">
      {/* Product Search/Select */}
      <div className="w-full md:w-1/2">
        <Select
          options={availableOptions}
          onChange={handleSelect}
          placeholder="Search or select a product..."
          isClearable
          className="text-slate-900"
          classNamePrefix="react-select"
          styles={{
            control: (base) => ({
              ...base,
              borderColor: '#d1d5db', // Tailwind border-gray-300
              padding: '2px',
              fontSize: '0.875rem', // text-sm
            }),
            menu: (base) => ({
              ...base,
              zIndex: 50,
            }),
            option: (provided, state) => ({
              ...provided,
              backgroundColor: state.isFocused ? "#3BA0AC" : "white",
              color: "#1e293b", // slate-900
            }),
          }}
        />
      </div>

      {/* Selected Product List */}
      {value.map((product, index) => (
        <div
          key={index}
          className="flex flex-col md:flex-row md:items-end md:space-x-2 space-y-2 md:space-y-0 bg-sky-50 p-2 rounded"
        >
          <div className="flex-1">
            <p>Name: {product.productName}</p>
          </div>
          <div className="flex-1">
            <p>Quantity:</p>
            <input
              type="number"
              min={0}
              value={product.Qty}
              onChange={(e) => updateField(index, "Qty", e.target.value)}
              className="border px-2 py-1 rounded w-full bg-white"
            />
          </div>
          <div className="flex-1">
            <p>Unitary Price:</p>
            <input
              type="number"
              value={product.productUnitaryPrice}
              onChange={(e) =>
                updateField(index, "productUnitaryPrice", e.target.value)
              }
              className="border px-2 py-1 rounded w-full bg-white"
            />
          </div>
          <div className="flex-1">
            <p>Final Price:</p>
            <input
              type="number"
              value={product.productFinalPrice}
              disabled
              className="bg-cyan-50 border px-2 py-1 rounded w-full"
            />
          </div>
          <div>
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="text-red-400 hover:text-red-600"
              title="Remove Product"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductSelectForm;