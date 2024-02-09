import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { ChangeEvent, MouseEvent, useState } from 'react'
import { toast } from 'sonner'

interface NewNoteCardProps {
  onNoteCreated: (content: string) => void
}

let speechRecognition: SpeechRecognition | null;

export function NewNoteCard({ onNoteCreated }: NewNoteCardProps) {

  const [ shouldShowOnboarding, setShouldShowOnboarding ] = useState(true);
  const [ content, setContent ] = useState('');
  const [ isRecording, setIsRecording ] = useState(false);

  function handleStartEditor(): void {
    setShouldShowOnboarding(false)
  }

  function handleContentChanged(event: ChangeEvent<HTMLTextAreaElement>): void {
    setContent(event.target.value);

    if (event.target.value === '') {
      setShouldShowOnboarding(true)
    }
  }

  function handleSaveNote(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    if (content === '') {
      toast.error('Nota vazia!');
      return;
    }

    onNoteCreated(content);

    setContent('');

    setShouldShowOnboarding(true);
    
    toast.success('Nota salva com sucesso!');
  }

  function handleStartRecording() {

    const isSpeechRecognitionAvailable = 'webkitSpeechRecognition' in window || 'speechRecognition' in window;

    if (!isSpeechRecognitionAvailable) {
      toast.error('Desculpe, mas seu navegador não suporta a API de fala. Por favor, tente novamente em um navegador mais moderno.')
      return;
    }

    setIsRecording(true);
    setShouldShowOnboarding(false);

    const SpeechRecognitionAPI = (window.SpeechRecognition || window.webkitSpeechRecognition);

    speechRecognition = new SpeechRecognitionAPI();

    speechRecognition.lang = 'pt-BR';
    speechRecognition.continuous = true;
    speechRecognition.maxAlternatives = 1;
    speechRecognition.interimResults = true;

    speechRecognition.onresult = (event) => {
      const transcription = Array.from(event.results).reduce((transcript, result) => transcript.concat(result[0].transcript), '');
      setContent(transcription);
    }

    speechRecognition.onerror = (event) => {
      console.error(event);
    }

    speechRecognition.start();
    
  }

  function handleStopRecording() {
    setIsRecording(false);

    if (speechRecognition !== null) {
      speechRecognition.stop();
      speechRecognition = null;
    }
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger className='rounded-md bg-slate-700 text-left p-5 gap-3 flex flex-col outline-none hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400'>
        <span className='text-sm font-medium text-slate-200'>Adicionar nota</span>
        <p className='text-sm leading-6 text-slate-400'>Grave uma nota em áudio que será convertida para texto automaticamente.</p>
      </Dialog.Trigger>

      <Dialog.Portal>
              <Dialog.Overlay className='inset-0 fixed bg-black/60' />
              <Dialog.Content className='
                  fixed inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] w-full md:h-[60vh] bg-slate-700
                  md:rounded-md flex flex-col outline-none overflow-hidden
              '>
                  <Dialog.Close className='absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100'>
                      <X className='size-5'/>
                  </Dialog.Close>

                  <form className='flex flex-1 flex-col'>
                    <div className='flex flex-1 flex-col gap-3 p-5'>
                        <span className='text-sm font-medium text-slate-300'>
                            Adicionar nota
                        </span>
                        { shouldShowOnboarding ? (
                          <p className='text-sm leading-6 text-slate-400'>
                          Comece <button type='button' className='text-lime-400 font-medium hover:underline' onClick={handleStartRecording}>gravando uma nota</button> em áudio ou se preferir <button type='button' className='text-lime-400 font-medium hover:underline' onClick={handleStartEditor}>utilize apenas texto</button>.
                          </p>
                        ) : (
                          <textarea
                            autoFocus
                            className='text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none'
                            onChange={handleContentChanged}
                            value={content}
                          ></textarea>
                        )}
                        
                    </div>

                    { isRecording ? (
                      <button
                        type='button'
                        onClick={handleStopRecording}
                        className='w-full bg-slate-900 hover:text-slate-100 py-4 text-center text-sm text-slate-300 outline-none font-medium flex items-center justify-center gap-1'
                      >
                        <div className='rounded-full bg-red-500 size-3 animate-pulse' />
                        Gravando! (clique para interromper)
                      </button>
                    ) : (
                      <button
                        onClick={handleSaveNote}
                        type='button'
                        className='w-full bg-lime-400 hover:bg-lime-500 py-4 text-center text-sm text-lime-950 outline-none font-medium'
                      >
                        Salvar nota
                      </button>
                    )}

                  </form>
              </Dialog.Content>
          </Dialog.Portal>
    </Dialog.Root>
  )
}