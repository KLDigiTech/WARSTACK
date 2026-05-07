export function createTable({

  headers = [],
  rows = ''

}) {

  return `

    <table class="data-table">

      <thead>

        <tr>

          ${headers.map(h => `
            <th>${h}</th>
          `).join('')}

        </tr>

      </thead>

      <tbody>

        ${rows}

      </tbody>

    </table>

  `;
}