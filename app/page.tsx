"use client"

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

function page() {

  const supabase = createClient()
  const router = useRouter()

  const [user, setUser] = useState<User | null>()
  const [notes, setNotes] = useState<any[]>([])
  const [note, setNote] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingUser, setIsFetchingUser] = useState(true)

  const getNotes = async (user: string) => {

    setIsLoading(true)

    const { data, error } = await supabase
      .from('notes')
      .select()
      .eq('user', user)
      .order('id', { ascending: false })

    if (data) {
      setNotes(data)
      setIsLoading(false)
    } else {
      alert(error.message)
      setNotes(["No note exist for this user"])
    }
  }

  const isLoggedIn = async () => {

    setIsFetchingUser(true)

    const {
      data: { user }
    } = await supabase.auth.getUser()

    setUser(user)

    if (user) {
      getNotes(user.id)
    } else {
      router.replace("/login")
    }

    setIsFetchingUser(false)
  }

  const addNote = async () => {

    setIsLoading(true)

    const { error } = await supabase
      .from('notes')
      .insert({ note_content: (note === "" ? "Nothing" : note), user: user?.id })
      .eq("user", user?.id)

    if (error) {
      console.log(error)
    } else {
      if (user) {
        getNotes(user.id)
      }
    }
  }

  const handleAddNote = () => {
    addNote()
  }

  useEffect(() => {
    isLoggedIn()
  }, [])

  const handleDelete = async (note: number) => {

    setIsLoading(true)

    const response = await supabase
      .from('notes')
      .delete()
      .eq("id", note)

    if (user) {
      getNotes(user?.id)
      if (response.error) {
        alert(response.error)
      }
    }
  }

  if (isFetchingUser) {
    return (
      <p>Loading....</p>
    )
  }
  else {
    return (
      <div className=' w-full h-screen'>

        <div className=' w-screen flex items-center justify-end p-10 box-border'>
          <a href="/api/auth/logout" className=' text-blue-600'>Logout</a>
        </div>

        <h1 className=' font-mono text-3xl text-center font-bold'>Notes</h1>

        <div className=' flex items-center justify-between md:w-3/5 w-4/5 ml-auto mr-auto mt-10 gap-5'>
          <input className=' w-3/4 bg-transparent ring-1 ring-black rounded-lg  p-3 box-border focus:ring-2 outline-none text-lg' type="text" placeholder='Enter note' onChange={(e) => {
            setNote(e.target.value)
          }} />
          {isLoading ? (
            <button className=' w-1/4 bg-black text-white p-3 rounded-lg pr-6 pl-6 text-base' onClick={handleAddNote} aria-disabled>Loading...
              ⛸️</button>
          ) : (
            <button className=' w-1/4 bg-black text-white p-3 rounded-lg pr-6 pl-6 text-xl' onClick={handleAddNote}>Add</button>
          )}
        </div>

        <div className=' mt-10 md:w-3/5 w-4/5 ring-1 ring-black ml-auto mr-auto rounded-lg p-3 box-border h-96 overflow-y-auto notes-container'>

          <h1 className=' font-mono md:text-2xl text-xl font-bold mb-10'>
            <span className=' font-mono text-green-600 md:text-2xl text-base'>{user?.email}'s </span>
            Notes
          </h1>

          {/* DIsplay db notes */}

          {
            isLoading ? <div className=' w-full h-full bg-yellow-600 bg-opacity-20 rounded-lg flex items-center justify-center'>
              <p className=' font-mono text-3xl text-center'>Loading... ⛸️⛸️🏓</p>
            </div> : (
              notes[0] ? notes.map(note => {
                return (
                  <div className=' w-11/12 h-max mb-10 last-of-type:mb-0 ring-1 ring-black pt-3 pb-3 box-content rounded-lg flex items-center justify-between ml-auto mr-auto' key={note.id}>

                    <div className=' w-full'>
                      <div className=' flex items-center justify-start gap-0 w-full mb-3'>

                        <p className=' font-mono text-sm ml-5 text-yellow-500'>Created at: {(
                          note.created_at.split("T")[0]
                        )}
                        </p>

                        <p className=' font-mono text-sm ml-5 mr-5 text-yellow-500'>Time: {(
                          note.created_at.split("T")[1].split(".")[0].split(":")[0]
                        )}:{note.created_at.split("T")[1].split(".")[0].split(":")[1]}
                        </p>

                      </div>

                      <p className=' font-mono text-2xl mr-5 ml-5'>{note.note_content}</p>
                    </div>

                    <i className="fa-solid fa-trash-can text-2xl mr-5 flex items-center justify-center cursor-pointer" onClick={() => {
                      handleDelete(note.id)
                    }}></i>
                  </div>
                )
              }) : (
                <p className=' text-center text-2xl font-medium'>You have no notes... 🏓🙃⛸️📒📝</p>
              )
            )
          }

        </div>
      </div>
    )
  }
}

export default page