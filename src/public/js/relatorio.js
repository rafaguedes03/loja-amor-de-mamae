document.addEventListener('DOMContentLoaded', () => {
    const formRelatorio = document.getElementById('formRelatorio');
    const listaRelatorio = document.getElementById('listaRelatorio');
    const divTotalMes = document.getElementById('totalMes'); // Nova div para o valor total

    // Gerar relatório
    formRelatorio.addEventListener('submit', async (e) => {
        e.preventDefault();
        const mes = document.getElementById('mes').value;

        try {
            const response = await fetch(`/api/relatorio?mes=${mes}`);
            if (!response.ok) throw new Error('Erro ao carregar relatório');
            const { vendas, totalMes } = await response.json();

            // Exibir vendas na tabela
            listaRelatorio.innerHTML = vendas.map(venda => `
                <tr>
                    <td class="px-4 py-2">${new Date(venda.data_venda).toLocaleDateString()}</td>
                    <td class="px-4 py-2">${venda.cliente_nome}</td>
                    <td class="px-4 py-2">R$ ${parseFloat(venda.total_venda).toFixed(2)}</td>
                    <td class="px-4 py-2">${venda.forma_pagamento}</td>
                </tr>
            `).join('');

            // Exibir valor total do mês
            divTotalMes.innerHTML = `
                <div class="bg-green-100 p-4 rounded-md mt-4 flex flex-col items-center text-center">
                    <h3 class="text-lg font-semibold w-max ">Faturamento do Mês:</h3>
                    <p class="text-3xl font-bold text-green-700 w-max">R$ ${parseFloat(totalMes).toFixed(2)}</p>
                </div>
            `;
        } catch (err) {
            console.error(err);
            alert('Erro ao carregar relatório');
        }
    });
});