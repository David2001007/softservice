-- Certifique-se de ter ao menos 1 Cliente, 1 Usuário e 1 Técnico cadastrados antes de rodar este script.

DO $$
DECLARE
    v_cliente_id INT;
    v_tecnico_id INT;
    v_user_id INT;
    v_tipo_servico VARCHAR;
    v_status VARCHAR;
    v_data_agendada TIMESTAMP;
    v_numero VARCHAR;
BEGIN
    -- Busca o primeiro cliente existente (para evitar falha de chave estrangeira)
    SELECT id INTO v_cliente_id FROM clientes LIMIT 1;
    -- Busca o primeiro usuário existente
    SELECT id INTO v_user_id FROM users LIMIT 1;

    IF v_cliente_id IS NULL THEN
        RAISE EXCEPTION 'Nenhum cliente encontrado. Por favor, cadastre ao menos um cliente primeiro.';
    END IF;

    FOR i IN 1..100 LOOP
        -- Seleciona técnico e cliente aleatórios para CADA interação do loop
        SELECT id INTO v_tecnico_id FROM tecnicos ORDER BY RANDOM() LIMIT 1;
        SELECT id INTO v_cliente_id FROM clientes ORDER BY RANDOM() LIMIT 1;
        
        -- Sorteia tipo de serviço
        v_tipo_servico := (ARRAY['instalacao', 'manutencao', 'troca_equipamento', 'infra', 'outro'])[floor(random() * 5 + 1)];
        
        -- Sorteia status
        v_status := (ARRAY['aberta', 'agendada', 'em_execucao', 'concluida', 'cancelada', 'reagendada', 'pendente'])[floor(random() * 7 + 1)];
        
        -- Define data agendada (algumas para hoje, outras para o passado/futuro)
        v_data_agendada := CURRENT_TIMESTAMP + (random() * 30 - 10) * INTERVAL '1 day';
        
        -- Gera número da OS único
        v_numero := 'OS-TEST-' || LPAD((i + (SELECT COALESCE(MAX(id), 0) FROM ordens_servico))::text, 5, '0');

        INSERT INTO ordens_servico (
            numero, 
            data_abertura, 
            criado_por_id, 
            cliente_id, 
            tipo_servico, 
            descricao_problema, 
            prioridade, 
            data_agendada, 
            tecnico_id, 
            status,
            created_at,
            updated_at
        ) VALUES (
            v_numero,
            CURRENT_TIMESTAMP - (random() * 60) * INTERVAL '1 day',
            v_user_id,
            v_cliente_id,
            v_tipo_servico::os_tipo_servico,
            'OS de teste gerada em lote para validação de dashboard',
            (ARRAY['baixa', 'normal', 'alta'])[floor(random() * 3 + 1)]::os_prioridade,
            CASE WHEN v_status IN ('agendada', 'reagendada', 'pendente') THEN v_data_agendada ELSE NULL END,
            v_tecnico_id,
            v_status::os_status,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        );
    END LOOP;
END $$;
