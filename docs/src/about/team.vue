<script setup>
import {
    VPTeamMembers,
    VPTeamPage,
    VPTeamPageTitle,
} from 'vitepress/theme';

const members = [
    {
        avatar: 'https://www.github.com/tada5hi.png',
        name: 'tada5hi',
        title: 'Lead, Developer & DevOps',
        links: [
            {
                icon: 'github',
                link: 'https://github.com/tada5hi',
            },
            {
                icon: 'twitter',
                link: 'https://twitter.com/tada5hi',
            },
            {
                icon: 'linkedin',
                link: 'https://www.linkedin.com/in/peter-placzek-047a74210/',
            },
        ],
    },
    {
        avatar: 'https://www.github.com/maxju.png',
        name: 'maxju',
        title: 'DevOps',
        links: [
            {
                icon: 'github',
                link: 'https://github.com/maxju',
            },
        ],
    },
];
</script>

<template>
    <div>
        <VPTeamPage>
            <VPTeamPageTitle>
                <template #title>
                    Our Team
                </template>
            </VPTeamPageTitle>
            <VPTeamMembers
                :members="members"
            />
        </VPTeamPage>
    </div>
</template>
