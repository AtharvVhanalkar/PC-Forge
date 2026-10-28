import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import Button from './Button'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

function Modal({ open, title, onClose, children, footer }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  return createPortal(
    <dialog
      ref={dialogRef}
      className="ui-modal"
      aria-labelledby={titleId}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault()
          onClose()
        }
      }}
      onClose={() => {
        if (open) onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="ui-modal__content">
        <div className="ui-modal__header">
          <h2 id={titleId}>{title}</h2>
          <Button
            type="button"
            variant="ghost"
            arrow={false}
            aria-label="Close dialog"
            onClick={onClose}
          >
            ×
          </Button>
        </div>
        <div>{children}</div>
        {footer && <div className="ui-modal__footer">{footer}</div>}
      </div>
    </dialog>,
    document.body,
  )
}

export default Modal
