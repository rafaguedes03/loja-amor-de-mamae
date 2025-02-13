document.addEventListener('DOMContentLoaded', () => {
    const formCliente = document.getElementById('formCliente');
    const listaClientes = document.getElementById('listaClientes');
    let clientes = []; // Lista de clientes carregados

    // Função para carregar clientes
    async function carregarClientes() {
        try {
            const response = await fetch('/api/clientes');
            if (!response.ok) throw new Error('Erro ao carregar clientes');
            clientes = await response.json(); // Atualiza a variável clientes
            atualizarListaClientes();
        } catch (err) {
            console.error(err);
            alert('Erro ao carregar clientes');
        }
    }

    //funcao para rolar ate o fim ao clicar em editar!
    function rolarAteOFim() {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }

    // Função para atualizar a lista de clientes na tabela
    function atualizarListaClientes() {
        listaClientes.innerHTML = clientes.map(cliente => `
            <tr>
                <td class="px-4 py-2">${cliente.nome}</td>
                <td class="px-4 py-2">${cliente.telefone}</td>
                <td class="px-4 py-2">${cliente.endereco}</td>
                <td class="px-4 py-2">
                    <button onclick="abrirFormularioEdicao(${JSON.stringify(cliente).replace(/"/g, '&quot;')}); rolarAteOFim();" class="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 cursor-pointer">Editar</button>
                    <button onclick="excluirCliente(${cliente.id})" class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 cursor-pointer">Excluir</button>
                </td>
            </tr>
        `).join('');
    }

    // Função para abrir o formulário de edição
    window.abrirFormularioEdicao = (cliente) => {
        const formularioEdicao = `
            <div class="bg-white p-6 rounded shadow mt-4">
                <h2 id="rolarParaBaixo()" class="text-xl font-semibold mb-4">Editar Cliente</h2>
                <form id="formEditarCliente" class="space-y-4">
                    <input type="hidden" id="editarClienteId" value="${cliente.id}">
                    <div>
                        <label for="editarNome" class="block text-sm font-medium text-gray-700">Nome</label>
                        <input type="text" id="editarNome" value="${cliente.nome}" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                    </div>
                    <div>
                        <label for="editarTelefone" class="block text-sm font-medium text-gray-700">Telefone</label>
                        <input type="text" id="editarTelefone" value="${cliente.telefone}" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                    </div>
                    <div>
                        <label for="editarEndereco" class="block text-sm font-medium text-gray-700">Endereço</label>
                        <textarea id="editarEndereco" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">${cliente.endereco}</textarea>
                    </div>
                    <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Salvar</button>
                    <button type="button" onclick="fecharFormularioEdicao()" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancelar</button>
                </form>
            </div>
        `;

        // Adicionar o formulário à página
        document.getElementById('formularioEdicaoContainer').innerHTML = formularioEdicao;

        // Adicionar evento de submit ao formulário
        document.getElementById('formEditarCliente').addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('editarClienteId').value;
            const nome = document.getElementById('editarNome').value;
            const telefone = document.getElementById('editarTelefone').value;
            const endereco = document.getElementById('editarEndereco').value;

            try {
                const response = await fetch(`/api/clientes/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome, telefone, endereco })
                });

                if (!response.ok) throw new Error('Erro ao atualizar cliente');

                alert('Cliente atualizado com sucesso!');
                fecharFormularioEdicao();
                carregarClientes(); // Recarregar a lista de clientes
            } catch (err) {
                console.error(err);
                alert('Erro ao atualizar cliente');
            }
        });
    };

    // Função para fechar o formulário de edição
    window.fecharFormularioEdicao = () => {
        document.getElementById('formularioEdicaoContainer').innerHTML = '';
    };

    // Função para excluir um cliente
    window.excluirCliente = async (id) => {
        if (confirm('Tem certeza que deseja excluir este cliente?')) {
            try {
                const response = await fetch(`/api/clientes/${id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) throw new Error('Erro ao excluir cliente');

                alert('Cliente excluído com sucesso!');
                carregarClientes(); // Recarregar a lista de clientes
            } catch (err) {
                console.error(err);
                alert('Erro ao excluir cliente');
            }
        }
    };

    // Cadastrar novo cliente
    formCliente.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(formCliente);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/clientes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Erro ao cadastrar cliente');

            formCliente.reset();
            carregarClientes(); // Recarregar a lista de clientes
        } catch (err) {
            console.error(err);
            alert('Erro ao cadastrar cliente');
        }
    });

    // Carregar clientes ao iniciar
    carregarClientes();
});