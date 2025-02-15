document.addEventListener('DOMContentLoaded', () => {
    const formProduto = document.getElementById('formProduto');
    const listaProdutos = document.getElementById('listaProdutos');

    // Função para carregar produtos
    async function carregarProdutos() {
        const response = await fetch('/api/produtos');
        const produtos = await response.json();
        listaProdutos.innerHTML = produtos.map(produto => `
            <tr>
                <td class="px-4 py-2">${produto.nome}</td>
                <td class="px-4 py-2">${produto.descricao}</td>
                <td class="px-4 py-2">R$ ${parseFloat(produto.preco).toFixed(2)}</td>
                <td class="px-4 py-2">${produto.quantidade_estoque}</td>
                <td class="px-4 py-2">
                    <button onclick="abrirFormularioEdicao(${JSON.stringify(produto).replace(/"/g, '&quot;')})" class="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 cursor-pointer">Editar</button>
                    <button onclick="excluirProduto(${produto.id})" class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 cursor-pointer">Excluir</button>
                </td>
            </tr>
        `).join('');
    }

    // Função para atualizar a lista de produtos na tabela
    function atualizarListaProdutos(produtos) {
        listaProdutos.innerHTML = produtos.map(produto => `
            <tr>
                <td class="px-4 py-2">${produto.nome}</td>
                <td class="px-4 py-2">${produto.descricao}</td>
                <td class="px-4 py-2">R$ ${parseFloat(produto.preco).toFixed(2)}</td>
                <td class="px-4 py-2">${produto.quantidade_estoque}</td>
                <td class="px-4 py-2">
                    <button onclick="abrirFormularioEdicao(${JSON.stringify(produto).replace(/"/g, '&quot;')})" class="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600">Editar</button>
                    <button onclick="excluirProduto(${produto.id})" class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Excluir</button>
                </td>
            </tr>
        `).join('');
    }

    // Cadastrar novo produto
    formProduto.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(formProduto);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/produtos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Erro ao cadastrar produto');

            formProduto.reset();
            carregarProdutos(); // Recarregar a lista de produtos
        } catch (err) {
            console.error(err);
            alert('Erro ao cadastrar produto');
        }
    });

    // Função para abrir o formulário de edição
    window.abrirFormularioEdicao = (produto) => {
        const formularioEdicao = `
            <div class="bg-white p-6 rounded shadow mt-4">
                <h2 class="text-xl font-semibold mb-4">Editar Produto</h2>
                <form id="formEditarProduto" class="space-y-4">
                    <input type="hidden" id="editarProdutoId" value="${produto.id}">
                    <div>
                        <label for="editarNome" class="block text-sm font-medium text-gray-700">Nome</label>
                        <input type="text" id="editarNome" value="${produto.nome}" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                    </div>
                    <div>
                        <label for="editarDescricao" class="block text-sm font-medium text-gray-700">Descrição</label>
                        <textarea id="editarDescricao" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">${produto.descricao}</textarea>
                    </div>
                    <div>
                        <label for="editarPreco" class="block text-sm font-medium text-gray-700">Preço</label>
                        <input type="number" id="editarPreco" value="${produto.preco}" step="0.01" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                    </div>
                    <div>
                        <label for="editarQuantidade" class="block text-sm font-medium text-gray-700">Quantidade em Estoque</label>
                        <input type="number" id="editarQuantidade" value="${produto.quantidade_estoque}" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                    </div>
                    <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Salvar</button>
                    <button type="button" onclick="fecharFormularioEdicao()" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancelar</button>
                </form>
            </div>
        `;

        // Adicionar o formulário à página
        document.getElementById('formularioEdicaoContainer').innerHTML = formularioEdicao;

        // Adicionar evento de submit ao formulário
        document.getElementById('formEditarProduto').addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('editarProdutoId').value;
            const nome = document.getElementById('editarNome').value;
            const descricao = document.getElementById('editarDescricao').value;
            const preco = document.getElementById('editarPreco').value;
            const quantidade = document.getElementById('editarQuantidade').value;

            try {
                const response = await fetch(`/api/produtos/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome, descricao, preco, quantidade })
                });

                if (!response.ok) throw new Error('Erro ao atualizar produto');

                alert('Produto atualizado com sucesso!');
                fecharFormularioEdicao();
                carregarProdutos(); // Recarregar a lista de produtos
            } catch (err) {
                console.error(err);
                alert('Erro ao atualizar produto');
            }
        });
    };

    // Função para fechar o formulário de edição
    window.fecharFormularioEdicao = () => {
        document.getElementById('formularioEdicaoContainer').innerHTML = '';
    };

    // Função para excluir um produto
    window.excluirProduto = async (id) => {
        if (confirm('Tem certeza que deseja excluir este produto?')) {
            try {
                const response = await fetch(`/api/produtos/${id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) throw new Error('Erro ao excluir produto');

                alert('Produto excluído com sucesso!');
                carregarProdutos(); // Recarregar a lista de produtos
            } catch (err) {
                console.error(err);
                alert('Erro ao excluir produto');
            }
        }
    };

    // Carregar produtos ao iniciar
    carregarProdutos();
});