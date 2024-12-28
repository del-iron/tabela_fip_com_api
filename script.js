const API_BASE = 'https://parallelum.com.br/fipe/api/v1';
const selects = {
    tipo: document.getElementById('tipo'),
    marca: document.getElementById('marca'),
    modelo: document.getElementById('modelo'),
    ano: document.getElementById('ano')
};
const btnConsultar = document.getElementById('consultar');
const loading = document.querySelector('.loading');
const error = document.querySelector('.error');
const resultado = document.querySelector('.resultado');

async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Erro na requisição');
        return await response.json();
    } catch (err) {
        console.error(err);
        throw err;
    }
}

function showLoading() {
    loading.style.display = 'block';
    error.style.display = 'none';
}

function hideLoading() {
    loading.style.display = 'none';
}

function showError() {
    error.style.display = 'block';
    resultado.classList.remove('visible');
}

async function carregarMarcas() {
    const tipo = selects.tipo.value;
    if (!tipo) return;

    try {
        showLoading();
        selects.marca.innerHTML = '<option value="">Carregando...</option>';
        selects.marca.disabled = true;

        const marcas = await fetchData(`${API_BASE}/${tipo}/marcas`);
        
        selects.marca.innerHTML = '<option value="">Selecione a marca...</option>';
        marcas.forEach(marca => {
            const option = document.createElement('option');
            option.value = marca.codigo;
            option.textContent = marca.nome;
            selects.marca.appendChild(option);
        });
        
        selects.marca.disabled = false;
    } catch (err) {
        showError();
    } finally {
        hideLoading();
    }
}

async function carregarModelos() {
    const tipo = selects.tipo.value;
    const marcaId = selects.marca.value;
    if (!tipo || !marcaId) return;

    try {
        showLoading();
        selects.modelo.innerHTML = '<option value="">Carregando...</option>';
        selects.modelo.disabled = true;

        const {modelos} = await fetchData(`${API_BASE}/${tipo}/marcas/${marcaId}/modelos`);
        
        selects.modelo.innerHTML = '<option value="">Selecione o modelo...</option>';
        modelos.forEach(modelo => {
            const option = document.createElement('option');
            option.value = modelo.codigo;
            option.textContent = modelo.nome;
            selects.modelo.appendChild(option);
        });
        
        selects.modelo.disabled = false;
    } catch (err) {
        showError();
    } finally {
        hideLoading();
    }
}

async function carregarAnos() {
    const tipo = selects.tipo.value;
    const marcaId = selects.marca.value;
    const modeloId = selects.modelo.value;
    if (!tipo || !marcaId || !modeloId) return;

    try {
        showLoading();
        selects.ano.innerHTML = '<option value="">Carregando...</option>';
        selects.ano.disabled = true;

        const anos = await fetchData(`${API_BASE}/${tipo}/marcas/${marcaId}/modelos/${modeloId}/anos`);
        
        selects.ano.innerHTML = '<option value="">Selecione o ano...</option>';
        anos.forEach(ano => {
            const option = document.createElement('option');
            option.value = ano.codigo;
            option.textContent = ano.nome;
            selects.ano.appendChild(option);
        });
        
        selects.ano.disabled = false;
    } catch (err) {
        showError();
    } finally {
        hideLoading();
    }
}

async function consultarPreco() {
    const tipo = selects.tipo.value;
    const marcaId = selects.marca.value;
    const modeloId = selects.modelo.value;
    const anoId = selects.ano.value;
    
    if (!tipo || !marcaId || !modeloId || !anoId) return;

    try {
        showLoading();
        btnConsultar.disabled = true;
        
        const dados = await fetchData(
            `${API_BASE}/${tipo}/marcas/${marcaId}/modelos/${modeloId}/anos/${anoId}`
        );

        resultado.querySelector('.preco').textContent = dados.Valor;
        const detalhes = document.getElementById('detalhes');
        detalhes.innerHTML = `
            <p><strong>Marca:</strong> ${dados.Marca}</p>
            <p><strong>Modelo:</strong> ${dados.Modelo}</p>
            <p><strong>Ano:</strong> ${dados.AnoModelo}</p>
            <p><strong>Combustível:</strong> ${dados.Combustivel}</p>
            <p><strong>Código Fipe:</strong> ${dados.CodigoFipe}</p>
            <p><strong>Mês de Referência:</strong> ${dados.MesReferencia}</p>
        `;
        
        resultado.classList.add('visible');
    } catch (err) {
        showError();
    } finally {
        hideLoading();
        btnConsultar.disabled = false;
    }
}

// Event Listeners
selects.tipo.addEventListener('change', () => {
    carregarMarcas();
    selects.modelo.innerHTML = '<option value="">Selecione a marca primeiro...</option>';
    selects.modelo.disabled = true;
    selects.ano.innerHTML = '<option value="">Selecione o modelo primeiro...</option>';
    selects.ano.disabled = true;
    btnConsultar.disabled = true;
    resultado.classList.remove('visible');
});

selects.marca.addEventListener('change', () => {
    carregarModelos();
    selects.ano.innerHTML = '<option value="">Selecione o modelo primeiro...</option>';
    selects.ano.disabled = true;
    btnConsultar.disabled = true;
    resultado.classList.remove('visible');
});

selects.modelo.addEventListener('change', () => {
    carregarAnos();
    btnConsultar.disabled = true;
    resultado.classList.remove('visible');
});

selects.ano.addEventListener('change', () => {
    btnConsultar.disabled = !selects.ano.value;
    resultado.classList.remove('visible');
});

btnConsultar.addEventListener('click', consultarPreco);