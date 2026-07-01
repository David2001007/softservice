-- Este script redistribui os técnicos de forma perfeitamente igualitária (Round-Robin) 
-- entre todas as Ordens de Serviço existentes no banco de dados.

WITH os_ranked AS (
  -- Enumera todas as ordens de serviço (1, 2, 3, ...)
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) as rn
  FROM ordens_servico
),
tecnicos_ranked AS (
  -- Enumera todos os técnicos (1, 2, 3...) e conta o total deles
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) as rn, COUNT(*) OVER() as total_tecnicos
  FROM tecnicos
)
UPDATE ordens_servico
SET tecnico_id = (
  -- Usa o resto da divisão (MOD) para distribuir os técnicos de forma circular.
  -- Se você tem 5 técnicos, as OS receberão técnico 1, 2, 3, 4, 5, 1, 2, 3, 4, 5...
  SELECT t.id 
  FROM tecnicos_ranked t 
  WHERE t.rn = (MOD(os_ranked.rn, t.total_tecnicos) + 1)
)
FROM os_ranked
WHERE ordens_servico.id = os_ranked.id;
