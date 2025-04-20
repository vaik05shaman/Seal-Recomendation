import React from 'react'
import Sidebar from '../components/Sidebar'
import Workspace from '../components/Workspace'
import RightBar from '../components/RightBar'

const DashBord = () => {
  return (
    <div className="flex w-full  h-screen">
      <div className=' w-[20%]'>
        <Sidebar />
      </div>
      <div className=' w-[55%]'>
        <Workspace />
      </div>
      <div className=' w-[25%]'>
        <RightBar />
      </div>
  </div>
  )
}

export default DashBord
