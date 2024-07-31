export function GridSizeSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className={'!mt-5 w-full min-w-24'}>
      <label
        htmlFor={'size-slider'}
        className={'text-sm font-light text-stone-600'}>
        Grid Size
      </label>
      <input
        type={'range'}
        id={'size-slider'}
        value={value}
        min={1}
        max={7}
        className={'slider'}
        step={1}
        onChange={e => onChange(parseInt(e.target.value))}
      />
      <div
        className={
          'row mx-1 mt-1 flex justify-between text-sm font-light text-stone-600'
        }>
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
        <span>6</span>
        <span>7</span>
      </div>
    </div>
  );
}
