export async function initTickets() {

  document.getElementById(
    'section-content'
  ).innerHTML = `

    <div class="panel">

      <div class="panel-header">
        <h2>🎫 Tickets</h2>
      </div>

      <div class="panel-body">

        <div class="form-grid">

          <div class="form-group">

            <label>
              Catégorie tickets
            </label>

            <input
              type="text"
              class="form-input"
              placeholder="TICKETS"
            >

          </div>

          <div class="form-group">

            <label>
              Salon création
            </label>

            <input
              type="text"
              class="form-input"
              placeholder="ouvrir-ticket"
            >

          </div>

          <div class="form-group">

            <label>
              Rôle staff
            </label>

            <input
              type="text"
              class="form-input"
              placeholder="Staff"
            >

          </div>

          <div class="form-group">

            <label>
              Salon logs
            </label>

            <input
              type="text"
              class="form-input"
              placeholder="logs-tickets"
            >

          </div>

          <div class="form-group full">

            <label>
              Message ouverture
            </label>

            <textarea
              class="form-textarea"
              rows="4"
              placeholder="Clique sur le bouton pour ouvrir un ticket."
            ></textarea>

          </div>

        </div>

      </div>

    </div>

  `;
}