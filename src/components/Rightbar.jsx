import React, { useState } from 'react'

function RightBar() {
  const [promt, setPromt] = useState('')
  console.log(promt)
  return (
    <div className=' bg-blue-100 flex flex-col justify-between py-10 h-screen p-2'>
      <div>
      <div className=' text-2xl font-bold p-4'>
      Ask the AI
      </div>
      <div className=' text-lg p-4'>
        <p>Ask the AI about the simulation, and it will provide you with information.</p>
        </div>
</div>
        <div className=' text-lg p-4 flex flex-col gap-2'>
        <p onClick={()=>setPromt("What is the spindle speed for turning?")} className='cursor-pointer border w-fit px-2 py-1 rounded-md'>What is the spindle speed for turning?</p>
        <p onClick={()=>setPromt("What is the depth of cut for turning?")} className=' cursor-pointer border w-fit px-2 py-1 rounded-md'>What is the depth of cut for turning?</p>
        <p onClick={()=>setPromt("How the chatter can be improved?")} className=' cursor-pointer border w-fit px-2 py-1 rounded-md'>How the chatter can be improved?</p>
        <input
          value={promt}
          onChange={(e) => setPromt(e.target.value)} 
           type="text" className='w-full border rounded-md p-2 rounded-md' placeholder='Type your question here...' />
        <button
         
          className="border bg-blue-400 border-blue-400 text-white cursor-pointer p-2 rounded-md w-full text-lg font-bold"
        >
          Ask
        </button>
</div>    </div>
  )
}

export default RightBar
