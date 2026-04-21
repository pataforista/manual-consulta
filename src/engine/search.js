/**
 * Search service utilizing Fuse.js (via CDN in index.html)
 */

let fuse = null;

/**
 * Initializes the search index with loaded topics.
 * @param {Object} topicsById - Map of topics by ID.
 */
export function initSearch(topicsById) {
    // Flatten topics and their blocks for indexing
    const indexData = [];

    // KEYWORD INJECTION: Specialized medical synonyms and related terms
    const keywordMap = {
        'psych_clozapine_cigh': 'leponex agranulocitosis neutropenia estreñimiento ileo colitis',
        'psych_eps': 'parkinsonismo temblor rigidez acatisia distonia discinesia tardia extrapiramidalismo',
        'psych_suicide_risk': 'autolesion riesgo muerte ideacion intento crisis emergencia plan',
        'psych_qt_antipsychotics': 'ekg tdp arritmia conduccion torsade pointes',
        'psych_depression': 'animo tristeza apatia anhedonia deshopanza',
        'psych_anxiety': 'panico ataque tag fobia miedo preocupacion',
        'psych_bipolar': 'mania hipomania litio quetiapina valproato',
        'psych_hyperprolactinemia': 'galactorrea amenorrea ginecomastia impotencia risperidona',
        'psych_constipation': 'laxante motilidad transito obstruccion',
        'psych_med_monitoring': 'laboratorios sangre hepatico renal tiroides',
        'lifestyle_sleep': 'insomnio higiene circadiano melatonia',
        'comorb_t2dm': 'metformina diabetes glucosa hba1c insulina',
        'comorb_htn': 'presion hipertension sistolica diastolica crisis',
        'comorb_obesity': 'imc peso gordura sobrepeso bariatrica'
    };

    Object.values(topicsById).forEach(topic => {
        // Add the topic itself
        indexData.push({
            id: topic.id,
            type: 'topic',
            title: topic.title,
            tags: topic.tags || [],
            keywords: (keywordMap[topic.id] || '') + ' ' + (topic.keywords || ''),
            content: topic.title,
            path: `#/topic/${topic.id}`
        });

        // Add individual blocks
        if (topic.blocks) {
            topic.blocks.forEach(block => {
                if (block.title || block.content) {
                    indexData.push({
                        id: block.id,
                        topicId: topic.id,
                        type: 'block',
                        title: block.title || '',
                        content: block.content || '',
                        tags: topic.tags || [],
                        path: `#/topic/${topic.id}` // Scroll to block could be added later
                    });
                }
            });
        }
    });

    // Fuse.js is global from CDN
    if (typeof Fuse === 'undefined') {
        console.error('Fuse.js not found. Search will not work.');
        return;
    }

    const options = {
        keys: [
            { name: 'title', weight: 0.7 },
            { name: 'keywords', weight: 0.6 },
            { name: 'content', weight: 0.3 },
            { name: 'tags', weight: 0.5 },
            { name: 'id', weight: 0.1 }
        ],
        threshold: 0.3,
        includeMatches: true,
        minMatchCharLength: 2
    };

    fuse = new Fuse(indexData, options);
}

/**
 * Performs a fuzzy search.
 * @param {string} query - The search query.
 * @returns {Array} Search results.
 */
export function search(query) {
    if (!fuse || !query) return [];
    return fuse.search(query);
}
