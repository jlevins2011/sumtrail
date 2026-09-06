export function Keypad({
  onDigit,
  onBackspace,
  onSubmit,
  disabled,
}: {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onSubmit: () => void;
  disabled?: boolean;
}) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "back", "0", "go"];
  return (
    <div className="keypad" role="group" aria-label="Number pad">
      {keys.map((key) => {
        if (key === "back") {
          return (
            <button key={key} type="button" aria-label="Erase last digit" className="pad-key ghost" disabled={disabled} onClick={onBackspace}>
              ⌫
            </button>
          );
        }
        if (key === "go") {
          return (
            <button key={key} type="button" aria-label="Check answer" className="pad-key go" disabled={disabled} onClick={onSubmit}>
              ✓
            </button>
          );
        }
        return (
          <button key={key} type="button" className="pad-key" disabled={disabled} onClick={() => onDigit(key)}>
            {key}
          </button>
        );
      })}
    </div>
  );
}
