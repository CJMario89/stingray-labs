const InputFormItem = ({
  title,
  dataIndex,
  type,
  placeholder,
  onChange,
}: {
  title: string;
  dataIndex: string;
  type: string;
  placeholder: string;
  onChange: (value: string) => void;
}) => {
  return (
    <label className="form-control w-full max-w-xs">
      <div className="label">
        <span className="label-text">{title}</span>
      </div>
      {type === "text" && (
        <input
          type="text"
          name={dataIndex}
          placeholder={placeholder}
          className="input input-sm w-full max-w-xs"
          onChange={(e) => {
            onChange(e.target.value);
          }}
        />
      )}

      {type === "textarea" && (
        <textarea
          name={dataIndex}
          placeholder={placeholder}
          className="textarea w-full max-w-xs resize-none p-2"
          onChange={(e) => {
            onChange(e.target.value);
          }}
          aria-placeholder={placeholder}
          rows={5}
        ></textarea>
      )}

      {type === "number" && (
        <input
          type="number"
          name={dataIndex}
          placeholder={placeholder}
          className="no-stepper input input-sm w-full max-w-xs"
          onChange={(e) => {
            onChange(e.target.value);
          }}
        />
      )}

      {type === "datetime-local" && (
        <input
          type="datetime-local"
          name={dataIndex}
          placeholder={placeholder}
          className="input input-sm w-full max-w-xs"
          onChange={(e) => {
            onChange(e.target.value);
          }}
        />
      )}
    </label>
  );
};

export default InputFormItem;
