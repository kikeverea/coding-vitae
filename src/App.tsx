import './App.css'
import Select from "./components/Select/Select.tsx";

function App() {

  return (
    <>
      <div>
        <Select options={[
          { name: "Option 1", value: "option-1" },
          { name: "Option 2", value: "option-2" },
          { name: "Option 3", value: "option-3" }
        ]}/>
      </div>
    </>
  )
}

export default App
