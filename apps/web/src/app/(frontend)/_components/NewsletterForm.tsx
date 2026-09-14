const SENDPULSE_FORM_ID = 'f7c5369ed22df36b41a42db13fd30327ca717c1a7ccb7b626f966c0cbc2343ed'

interface NewsletterFormProps {
  compact?: boolean
  idPrefix: string
}

export function NewsletterForm({ compact = false, idPrefix }: NewsletterFormProps) {
  const formId = `sp-form-255263-${idPrefix}`
  const buttonId = `sp-button-255263-${idPrefix}`

  return (
    <div className={`sendpulse-newsletter ${compact ? 'sendpulse-newsletter--compact' : ''}`}>
      <div id={formId} sp-id="255263" sp-hash={SENDPULSE_FORM_ID} sp-lang="pt-br" className="sp-form sp-form-regular">
        <div className="sp-form-fields-wrapper">
          <div className="sp-message"><div /></div>
          <form noValidate className="sp-element-container sp-field-nolabel">
            <div className="sp-field">
              <label className={compact ? 'sr-only' : ''} htmlFor={`${formId}-email`}>
                <span>Assine a newsletter</span><strong> *</strong>
              </label>
              <input
                id={`${formId}-email`}
                type="email"
                sp-type="email"
                name="sform[email]"
                className="sp-form-control"
                placeholder="Email corporativo"
                sp-tips="%7B%22required%22%3A%22Campo%20obrigat%C3%B3rio%22%2C%22wrong%22%3A%22E-mail%20errado%22%7D"
                autoComplete="email"
                required
              />
            </div>
            <div className="sp-field sp-button-container">
              <button id={buttonId} type="submit" className="sp-button">Inscrever-se</button>
            </div>
          </form>
          <div className="sp-link-wrapper sp-brandname__left">
            <a className="sp-link" target="_blank" rel="noreferrer" href="https://sendpulse.com/forms-powered-by-sendpulse?sn=Y2xhdWRpbS5jb20%3D&amp;from=9507110">
              <span>Desenvolvido por SendPulse</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
