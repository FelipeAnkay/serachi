  import { Trash2 } from "lucide-react";

export default function ProductSelect({ products, value = [], onChange }) {
  const handleSelect = (productId) => {
    const already = value.find((item) => item.productId === productId);
    if (already) return;

    const newItem = { productId, quantity: 1, isPaid: false };
    const newList = [...value, newItem];
    onChange(newList);
  };

  const updateField = (index, field, val) => {
    const updated = [...value];
    updated[index] = {
      ...updated[index],
      [field]: field === "quantity" ? parseInt(val) : val,
    };
    onChange(updated);
  };

  const removeItem = (index) => {
    const updated = [...value];
    updated.splice(index, 1);
    onChange(updated);
  };

  const availableOptions = products.filter(
    (p) => !value.find((s) => s.productId === p._id)
  );

  return (
    <div className="mt-2 space-y-2">
      <select
        className="px-2 py-1 rounded text-white ml-2 mr-2 w-1/2"
        onChange={(e) => {
          if (e.target.value) handleSelect(e.target.value);
        }}
      >
        <option value="" className="text-blue-950">-- Select Product --</option>
        {availableOptions.map((p) => (
          <option key={p._id} value={p._id} className="text-blue-950">
            {p.name} (${p.price})
          </option>
        ))}
      </select>

      {value.map((item, index) => {
        const product = products.find((p) => p._id === item.productId);
        return (
          <div
            key={item.productId}
            className="flex items-center gap-2 bg-blue-800 p-2 rounded shadow ml-2 mr-2 mb-2"
          >
            <span className="flex-1 font-medium">{product?.name}</span>
            <input
              type="number"
              className="w-16 border rounded px-1 text-white"
              min={1}
              value={item.quantity}
              onChange={(e) => updateField(index, "quantity", e.target.value)}
            />
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={item.isPaid}
                onChange={(e) =>
                  updateField(index, "isPaid", e.target.checked)
                }
              />
              Paid?
            </label>
            <button
              className="text-red-600 hover:underline"
              onClick={() => removeItem(index)}
            >
              <Trash2 />
            </button>
          </div>
        );
      })}
    </div>
  );
}