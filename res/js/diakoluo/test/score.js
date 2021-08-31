const SCORE_REGISTRATION = {
    'exact': {
        m_t: "score-exact-t",
        m_m: "score-exact-m",
        match: function(_, _, answer, userAnswer) {
            return answer.value == userAnswer.value;
        },
    },
    'exact-ignore-case': {
        m_t: "score-ignore-case-t",
        m_m: "score-ignore-case-m",
        match: function(_, _, answer, userAnswer) {
            return answer.value.toLowerCase() == userAnswer.value.toLowerCase();
        }
    },
    get 'ignore-case'() {
        return this['exact-ignore-case'];
    },
    'contains': {
        m_t: "score-contains-t",
        m_m: "score-contains-m",
        showAnswer: true,
        multiple: true,
        parameters: [{
            type: 'select',
            name: 'type',
            options: [{
                value: 'all-words',
                text: 'score-contains-all-words',
                default: true
            }, {
                value: 'one-word',
                text: 'score-contains-one-word'
            }, {
                value: 'exact',
                text: 'score-contains-exact'
            }]
        }],
        match: function(_, rule, answer, userAnswer) {
            switch (rule.p_type) {
                case 'all-words':
                    return answer.value.split(" ").all(s => userAnswer.value.includes(s));

                case 'one-word':
                    return answer.value.split(" ").some(s => userAnswer.value.includes(s));

                default:
                    return userAnswer.value.includes(answer.value);
            }
        }
    },
    'fail': {
        m_t: "score-fail-t",
        m_m: "score-fail-m",
        showAnswer: true,
        isWrong: true,
        match: function() {
            return true;
        }
    }
}
