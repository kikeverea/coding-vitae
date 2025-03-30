import './App.css'
import Select from "./components/Select/Select.tsx";
import Chip from "./components/Chip/Chip.tsx";

function App() {

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Chip label='Assist' icon={<i className="fa-solid fa-calendar-days"></i>} iconColor='#FFF'/>
        <Chip label='Filter' selectable={ true }/>
        <Chip label='Input' removable={ true } onRemove={ () => console.log('Remove!!') } />
        <Chip label='Suggestion'/>
        <Select
          options={[
            { name: "Tiger", value: "option-1" },
            { name: "Tiger cat", value: "option-2" },
            { name: "Lion", value: "option-3" }
          ]}
          placeholder='Select an option'
        />
      </div>
    </>
  )
}

export default App
