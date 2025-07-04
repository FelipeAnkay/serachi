import Select from 'react-select';

const ProductSelect = ({ productList, customService, setCustomService, setNameAutoGenerated }) => {
  const options = productList.map(product => ({
    value: product._id,
    label: `${product.name} - $${product.finalPrice.toFixed(2)}`,
    product,
  }));

  const handleChange = (selected) => {
    const product = selected?.product;
    if (product) {
      setCustomService({
        ...customService,
        productId: product._id,
        productName: product.name,
      });
      setNameAutoGenerated(true);
    }
  };

  return (
    <div className="mt-2">
      <label className="block text-sm font-medium mb-1 text-slate-800">Product:</label>
      <Select
        options={options}
        value={options.find(opt => opt.value === customService.productId) || null} // ← aquí lo haces controlado
        onChange={handleChange}
        placeholder="Select or search a product..."
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
  );
};

export default ProductSelect;