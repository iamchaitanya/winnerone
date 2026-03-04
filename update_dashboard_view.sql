DROP VIEW IF EXISTS public.player_scores_summary CASCADE;

CREATE OR REPLACE VIEW public.player_scores_summary AS
SELECT
    p.id as player_id,
    p.player_name,
    COALESCE(a.total, 0) as addition_total,
    COALESCE(s.total, 0) as subtraction_total,
    COALESCE(m.total, 0) as multiplication_total,
    COALESCE(m25.total, 0) as multiplication25_total,
    COALESCE(mul.total, 0) as multiply_total,
    COALESCE(d.total, 0) as divide_total,
    COALESCE(mm.total, 0) as mentalmath_total,
    COALESCE(mas.total, 0) as mathmastery_total,
    COALESCE(n.total, 0) as nifty_total,
    COALESCE(sen.total, 0) as sensex_total,
    COALESCE(sud.total, 0) as sudoku_total,
    COALESCE(mem.total, 0) as memory_total,
    COALESCE(wp.total, 0) as wordpower_total,
    COALESCE(b800.total, 0) as barron800_total,
    COALESCE(m500.total, 0) as manhattan500_total,
    (
        COALESCE(a.total, 0) +
        COALESCE(s.total, 0) +
        COALESCE(m.total, 0) +
        COALESCE(m25.total, 0) +
        COALESCE(mul.total, 0) +
        COALESCE(d.total, 0) +
        COALESCE(mm.total, 0) +
        COALESCE(mas.total, 0) +
        COALESCE(n.total, 0) +
        COALESCE(sen.total, 0) +
        COALESCE(sud.total, 0) +
        COALESCE(mem.total, 0) +
        COALESCE(wp.total, 0) +
        COALESCE(b800.total, 0) +
        COALESCE(m500.total, 0)
    ) as grand_total
FROM public.profiles p
LEFT JOIN (SELECT player_id, SUM(earnings) as total FROM public.addition_logs GROUP BY player_id) a ON p.id = a.player_id
LEFT JOIN (SELECT player_id, SUM(earnings) as total FROM public.subtraction_logs GROUP BY player_id) s ON p.id = s.player_id
LEFT JOIN (SELECT player_id, SUM(earnings) as total FROM public.multiplication_logs GROUP BY player_id) m ON p.id = m.player_id
LEFT JOIN (SELECT player_id, SUM(earnings) as total FROM public.multiplication25_logs GROUP BY player_id) m25 ON p.id = m25.player_id
LEFT JOIN (SELECT player_id, SUM(earnings) as total FROM public.multiply_logs GROUP BY player_id) mul ON p.id = mul.player_id
LEFT JOIN (SELECT player_id, SUM(earnings) as total FROM public.divide_logs GROUP BY player_id) d ON p.id = d.player_id
LEFT JOIN (SELECT player_id, SUM(earnings) as total FROM public.mentalmath_logs GROUP BY player_id) mm ON p.id = mm.player_id
LEFT JOIN (SELECT player_id, SUM(earnings) as total FROM public.mathmastery_logs GROUP BY player_id) mas ON p.id = mas.player_id
LEFT JOIN (SELECT player_id, SUM(earnings) as total FROM public.nifty_logs GROUP BY player_id) n ON p.id = n.player_id
LEFT JOIN (SELECT player_id, SUM(earnings) as total FROM public.sensex_logs GROUP BY player_id) sen ON p.id = sen.player_id
LEFT JOIN (SELECT player_id, SUM(earnings) as total FROM public.sudoku_logs GROUP BY player_id) sud ON p.id = sud.player_id
LEFT JOIN (SELECT player_id, SUM(earnings) as total FROM public.memory_logs GROUP BY player_id) mem ON p.id = mem.player_id
LEFT JOIN (SELECT player_id, SUM(earnings) as total FROM public.wordpower_logs GROUP BY player_id) wp ON p.id = wp.player_id
LEFT JOIN (SELECT player_id, SUM(earnings) as total FROM public.barron800_logs GROUP BY player_id) b800 ON p.id = b800.player_id
LEFT JOIN (SELECT player_id, SUM(earnings) as total FROM public.manhattan500_logs GROUP BY player_id) m500 ON p.id = m500.player_id;
