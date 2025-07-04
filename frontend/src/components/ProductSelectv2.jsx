  import { Trash2 } from "lucide-react";

export default function ProductSelect({ products, value = [], onChange }) {
  const handleSelect = (productId) => {
    const already = value.find((item) => item.productId === productId);
    if (already) return;
    const auxProduct = availableOptions.find((item) => item._id === productId);
    console.log("auxProduct: ", auxProduct)
    const newItem = { productId, Qty: 1, price: auxProduct.finalPrice, isPaid: false };
    const newList = [...value, newItem];
    onChange(newList);
  };

  const updateField = (index, field, val) => {
    const updated = [...value];
    updated[index] = {
      ...updated[index],
      [field]: field === "Qty" ? parseInt(val) : val,
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
    <div className="space-y-2">
      <select
        className="px-2 py-1 rounded text-slate-800 ml-2 mr-2 w-20/21 border"
        onChange={(e) => {
          if (e.target.value) handleSelect(e.target.value);
        }}
      >
        <option value="" className="text-slate-900">-- Select Product --</option>
        {availableOptions.map((p) => (
          <option key={p._id} value={p._id} className="text-slate-900">
            {p.name} (${p.finalPrice})
          </option>
        ))}
      </select>

      {value.map((item, index) => {
        const product = products.find((p) => p._id === item.productId);
        return (
          <div
            key={item.productId}
            className="flex items-center gap-2 bg-sky-50 p-2 rounded shadow ml-2 mr-2 mb-2"
          >
            <span className="flex-1 font-medium">{product?.name} (${product?.finalPrice})</span>
            <input
              type="number"
              className="w-16 border rounded px-1 text-slate-800"
              min={1}
              value={item.Qty}
              onChange={(e) => updateField(index, "Qty", e.target.value)}
            />
            <span className="flex-1 font-medium">Total: ${product?.finalPrice * item.Qty}</span>
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