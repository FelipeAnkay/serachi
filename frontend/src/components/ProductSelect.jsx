import Select from 'react-select';

const ProductSelect = ({ productList, customService, setCustomService, setNameAutoGenerated }) => {
  const options = productList.map(product => ({
    value: product._id,
    label: `${product.name} - $${product.price}`,
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
      <label className="block text-sm font-medium mb-1">Product:</label>
      <Select
        options={options}
        value={options.find(opt => opt.value === customService.productId) || null} // ← aquí lo haces controlado
        onChange={handleChange}
        placeholder="Select or search a product..."
        className="text-blue-950"
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
        }}
      />
    </div>
  );
};

export default ProductSelect;