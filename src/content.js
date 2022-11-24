const isMostLikelyMastodon = document.querySelector('#mastodon');

if (isMostLikelyMastodon) {
    const $modalRoot = document.querySelector('.modal-root');

    if ($modalRoot) {
        const observer = new MutationObserver(function(mutations_list) {
            mutations_list.forEach(function(mutation) {
                if (!mutation.addedNodes.length) return;

                const $profileUrlInput = document.querySelector('.modal-root .copypaste input[type="text"]');
                if (!$profileUrlInput) return;

                // Get username
                // First try the username meta tag. However, sometimes Mastodon forgets to inject it,
                // so we fall back to the username shown in the profile header
                let user = document.querySelector('meta[property="profile:username"]')?.getAttribute('content') || document.querySelector('.account__header .account__header__tabs__name small')?.innerText.substring(1);
                if (!user) return;

                $choiceBox = $profileUrlInput.closest('.interaction-modal__choices__choice');
                if (!$choiceBox) return;

                chrome.storage.sync.get({
                    local_domain: '',
                    web_domain: ''
                }, function(items) {
                    const LOCAL_DOMAIN = items.local_domain;
                    const WEB_DOMAIN = items.web_domain || LOCAL_DOMAIN;

                    if (!WEB_DOMAIN) {
                        $choiceBox.querySelector('p').innerText = 'Please configure the mastodon-profile-redirect browser extension to more easily follow this account, directly on your Mastodon instance.';
                        return;
                    }

                    $choiceBox.innerText = '';

                    $title = document.createElement('h3');
                    $titleSpan = document.createElement('span');
                    $titleSpan.innerText = `On ${LOCAL_DOMAIN}`;
                    $title.appendChild($titleSpan);
        
                    // Trim off @domain suffix in case it matches with LOCAL_DOMAIN. This due to https://github.com/mastodon/mastodon/issues/21469
                    if (user.endsWith(`@${LOCAL_DOMAIN}`)) {
                        user = user.substring(0, user.length - `@${LOCAL_DOMAIN}`.length);
                    }
        
                    // Create follow button
                    const $followButton = document.createElement('a');
                    $followButton.classList.add('button', 'button--block');
                    $followButton.href = `https://${WEB_DOMAIN}/authorize_interaction?uri=${encodeURIComponent(user)}`;
                    $followButton.innerText = 'Follow';
        
                    // Create show profile button
                    const $showButton = document.createElement('a');
                    $showButton.classList.add('button', 'button--block', 'button-tertiary');
                    $showButton.href = `https://${WEB_DOMAIN}/@${user}`;
                    $showButton.innerText = 'Show Profile';
        
                    // Inject stuff
                    $choiceBox.appendChild($title);
                    $choiceBox.appendChild($followButton);
                    $choiceBox.appendChild($showButton);

                });
            });
        });

        observer.observe($modalRoot, { subtree: true, childList: true });
    };
}