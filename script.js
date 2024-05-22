document.getElementById('userForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const usernames = document.getElementById('usernames').value.split(',').map(name => name.trim());
    const startDate = new Date(document.getElementById('startDate').value);
    const endDate = new Date(document.getElementById('endDate').value);

    showLoader();
    
    Promise.all([
        getWikipediaContributions(usernames, startDate, endDate),
        getCommonsContributions(usernames, startDate, endDate)
    ]).then(() => {
        hideLoader();
    }).catch(error => {
        console.error('Error:', error);
        hideLoader();
    });
});

function showLoader() {
    document.getElementById('loader').style.display = 'block';
}

function hideLoader() {
    document.getElementById('loader').style.display = 'none';
}

function getWikipediaContributions(usernames, startDate, endDate) {
    const userContributions = [];

    const promises = usernames.map(username => {
        return fetch(`https://fr.wikipedia.org/w/api.php?action=query&list=usercontribs&ucuser=${username}&uclimit=500&ucprop=title|timestamp&format=json&origin=*`)
            .then(response => response.json())
            .then(data => {
                const contributions = data.query.usercontribs.filter(contribution => {
                    const contributionDate = new Date(contribution.timestamp);
                    return contributionDate >= startDate && contributionDate <= endDate;
                });
                userContributions.push({ username, contributions });

                if (userContributions.length === usernames.length) {
                    const sortedContributors = sortContributors(userContributions);
                    displayResult(sortedContributors, startDate, endDate, 'Wikipedia');
                }
            });
    });

    return Promise.all(promises);
}

function getCommonsContributions(usernames, startDate, endDate) {
    const userContributions = [];

    const promises = usernames.map(username => {
        return fetch(`https://commons.wikimedia.org/w/api.php?action=query&list=usercontribs&ucuser=${username}&uclimit=500&ucprop=title|timestamp&format=json&origin=*`)
            .then(response => response.json())
            .then(data => {
                const contributions = data.query.usercontribs.filter(contribution => {
                    const contributionDate = new Date(contribution.timestamp);
                    return contributionDate >= startDate && contributionDate <= endDate;
                });
                userContributions.push({ username, contributions });

                if (userContributions.length === usernames.length) {
                    const sortedContributors = sortContributors(userContributions);
                    displayResult(sortedContributors, startDate, endDate, 'Commons');
                }
            });
    });

    return Promise.all(promises);
}

function sortContributors(userContributions) {
    return userContributions.sort((a, b) => b.contributions.length - a.contributions.length);
}

function displayResult(sortedContributors, startDate, endDate, platform) {
    const resultDiv = document.getElementById(`result${platform}`);
    if (sortedContributors.length > 0) {
        const topContributor = sortedContributors[0];
        let resultHTML = `<h2>Contributions sur ${platform} du ${startDate.toLocaleDateString()} au ${endDate.toLocaleDateString()}</h2>`;
        resultHTML += `<p>L'utilisateur avec le plus de contributions : <strong>${topContributor.username}</strong> (${topContributor.contributions.length} contributions)</p>`;
        resultHTML += `<h3>Liste des contributeurs :</h3><ul>`;
        
        sortedContributors.forEach(user => {
            resultHTML += `<li>${user.username} : ${user.contributions.length} contributions</li>`;
        });

        resultHTML += `</ul>`;
        resultDiv.innerHTML = resultHTML;
    } else {
        resultDiv.innerHTML = `<p>Aucun résultat trouvé pour ${platform}.</p>`;
    }
}

// JavaScript for the gradient animation
const colors = [
    "#0000FF", // Bleu
    "#FFD700", // Jaune
    "#000000", // Noir
    "#008000", // Vert
    "#FF0000"  // Rouge
];
let step = 0;

function changeBackground() {
    const colorIndices = [
        (step + 0) % colors.length,
        (step + 1) % colors.length,
        (step + 2) % colors.length,
        (step + 3) % colors.length,
    ];

    const gradient = `linear-gradient(270deg, ${colors[colorIndices[0]]}, ${colors[colorIndices[1]]}, ${colors[colorIndices[2]]}, ${colors[colorIndices[3]]})`;
    document.body.style.background = gradient;

    step++;
    if (step >= colors.length) {
        step = 0;
    }

    setTimeout(changeBackground, 3000);
}

changeBackground();
