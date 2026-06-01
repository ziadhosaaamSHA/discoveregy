import { Field } from "formik";

// InputField keeps the booking form's icon field styling consistent.
export function InputField({ icon, placeholder, type = "text", name, errors, touched }) {
  const Icon = icon;

  return (
    <div className="flex flex-col gap-1">
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl"
        style={{
          background: "linear-gradient(135deg, #c9a96e 0%, #d4b483 100%)",
          boxShadow: "inset 0 2px 6px rgba(0,0,0,0.2)",
        }}
      >
        <Icon size={18} className="text-gray-800 shrink-0" />
        <Field
          type={type}
          name={name}
          placeholder={placeholder}
          className="bg-transparent flex-1 text-gray-900 placeholder-gray-700 text-[14px] font-medium outline-none"
        />
      </div>
      {errors[name] && touched[name] && <p className="text-red-300 text-xs px-2">{errors[name]}</p>}
    </div>
  );
}
