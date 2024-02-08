import { ChangeEvent, useState } from 'react';
import logo from './assets/logo-nlw-expert.svg'
import { NewNoteCard } from './components/new-note-card'
import { NoteCard } from './components/note-card'

interface Note {
  id: string;
  date: Date;
  content: string;
}

export function App() {

  const [ search, setSearch ] = useState('');
  
  const [ notes, setNotes ] = useState<Note[]>(() => {
    const notesOnStorage = localStorage.getItem('@nlw-expert:notes');

    if (notesOnStorage) {
      return JSON.parse(notesOnStorage)
    }

    return []

  });

  function onNoteCreated(content: string) {
    const newNote = {
      id: crypto.randomUUID(),
      date: new Date(),
      content
    }

    const notesArray = [newNote, ...notes]

    setNotes(notesArray)

    localStorage.setItem('@nlw-expert:notes', JSON.stringify(notesArray))
  }

  function handleSearch(event: ChangeEvent<HTMLInputElement>) {
    const query = event.target.value;

    setSearch(query);
  }

  const filteredNotes = search === '' 
    ? notes
    : notes.filter(note => note.content.toLowerCase().includes(search.toLowerCase()))


  return (
    <div className="container mx-auto max-w-6xl my-12 space-y-6">
      <img src={logo} alt="Logo for NLW Expert" />

      <form className='w-full'>
        <input 
          type="text" 
          placeholder='Busque em suas notas...'
          className='w-full bg-transparent text-3xl font-semibold tracking-tight placeholder:text-slate-500 outline-none'
          onChange={handleSearch}
        />
      </form>

      <div className="h-px bg-slate-700"></div>

      <div className="grid grid-cols-3 auto-rows-[250px] gap-6">
        
        <NewNoteCard onNoteCreated={onNoteCreated} />

        {
          filteredNotes.map(note => (
            <NoteCard key={note.id} note={note} />
          ))
        }
      
        
      </div>
    </div>
  )
}