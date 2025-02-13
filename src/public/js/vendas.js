document.addEventListener('DOMContentLoaded', () => {
    const formVenda = document.getElementById('formVenda');
    const listaVendas = document.getElementById('listaVendas');
    const selectCliente = document.getElementById('cliente_id');
    const selectProduto = document.getElementById('produto_id');
    const listaProdutosVenda = document.getElementById('listaProdutosVenda');
    const btnAdicionarProduto = document.getElementById('adicionarProduto');
    const btnFinalizarVenda = document.getElementById('finalizarVenda');
    const inputTotalVenda = document.getElementById('total_venda');

    let produtosVenda = []; // Lista de produtos adicionados à venda
    let valorTotal = 0; // Valor total da venda

    // Carregar clientes e produtos
    async function carregarDados() {
        const [clientes, produtos] = await Promise.all([
            fetch('/api/clientes').then(res => res.json()),
            fetch('/api/produtos').then(res => res.json())
        ]);

        selectCliente.innerHTML = clientes.map(cliente => `
            <option value="${cliente.id}">${cliente.nome}</option>
        `).join('');

        selectProduto.innerHTML = produtos.map(produto => `
            <option value="${produto.id}">${produto.nome} (Estoque: ${produto.quantidade_estoque})</option>
        `).join('');
    }

    // Adicionar produto à venda
    btnAdicionarProduto.addEventListener('click', async () => {
        const produtoId = selectProduto.value;
        const produtoNome = selectProduto.options[selectProduto.selectedIndex].text;
        const quantidade = parseInt(document.getElementById('quantidade').value);

        if (!produtoId || quantidade < 0) {
            alert('Selecione um produto e insira uma quantidade válida.');
            return;
        }
        
        try {
            // Buscar preço do produto no backend
            const response = await fetch(`/api/produtos/${produtoId}`);
            if (!response.ok) throw new Error('Erro ao buscar produto');
            const produto = await response.json();
    
            // Adicionar à lista de produtos da venda
            produtosVenda.push({ produtoId, produtoNome, quantidade, preco: produto.preco });
    
            // Atualizar o valor total da venda
            valorTotal += produto.preco * quantidade;
            inputTotalVenda.value = valorTotal.toFixed(2);
    
            // Atualizar a tabela de produtos adicionados
            listaProdutosVenda.innerHTML = produtosVenda.map((produto, index) => `
                <tr>
                    <td class="px-4 py-2">${produto.produtoNome}</td>
                    <td class="px-4 py-2">${produto.quantidade}</td>
                    <td class="px-4 py-2">R$ ${(produto.preco * produto.quantidade).toFixed(2)}</td>
                    <td class="px-4 py-2">
                        <button onclick="removerProduto(${index})" class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Remover</button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error(err);
            alert('Erro ao adicionar produto');
        }
    });

    // Remover produto da venda
    window.removerProduto = (index) => {
        const produtoRemovido = produtosVenda[index];
        valorTotal -= produtoRemovido.preco * produtoRemovido.quantidade; // Atualizar valor total
        inputTotalVenda.value = valorTotal.toFixed(2);

        produtosVenda.splice(index, 1); // Remover produto da lista
        listaProdutosVenda.innerHTML = produtosVenda.map((produto, index) => `
            <tr>
                <td class="px-4 py-2">${produto.produtoNome}</td>
                <td class="px-4 py-2">${produto.quantidade}</td>
                <td class="px-4 py-2">R$ ${(produto.preco * produto.quantidade).toFixed(2)}</td>
                <td class="px-4 py-2">
                    <button onclick="removerProduto(${index})" class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Remover</button>
                </td>
            </tr>
        `).join('');
    };

    // Permitir edição manual do valor total
    inputTotalVenda.addEventListener('input', () => {
        valorTotal = parseFloat(inputTotalVenda.value) || 0;
    });

    // Finalizar venda
    btnFinalizarVenda.addEventListener('click', async () => {
        const clienteId = selectCliente.value;
        const formaPagamento = document.getElementById('forma_pagamento').value;
        const totalVenda = parseFloat(inputTotalVenda.value);

        if (!clienteId || isNaN(totalVenda) || totalVenda <= 0) {
            alert('Preencha todos os campos corretamente.');
            return;
        }

        try {
            const response = await fetch('/api/vendas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clienteId, produtosVenda, formaPagamento, totalVenda })
            });

            if (!response.ok) throw new Error('Erro ao registrar venda');

            alert('Venda registrada com sucesso!');
            produtosVenda = []; // Limpar lista de produtos
            valorTotal = 0; // Resetar valor total
            inputTotalVenda.value = ''; // Limpar campo de valor total
            listaProdutosVenda.innerHTML = ''; // Limpar tabela
            carregarVendas(); // Atualizar lista de vendas
        } catch (err) {
            console.error(err);
            alert('Erro ao registrar venda');
        }
    });

    // Carregar vendas
    async function carregarVendas() {
        const response = await fetch('/api/vendas');
        const vendas = await response.json();
        listaVendas.innerHTML = vendas.map(venda => `
            <tr>
                <td class="px-4 py-2">${new Date(venda.data_venda).toLocaleDateString()}</td>
                <td class="px-4 py-2">${venda.cliente_nome}</td>
                <td class="px-4 py-2">R$ ${parseFloat(venda.total_venda).toFixed(2)}</td>
                <td class="px-4 py-2">${venda.forma_pagamento}</td>
            </tr>
        `).join('');
    }

    // Inicializar
    carregarDados();
    carregarVendas();
});