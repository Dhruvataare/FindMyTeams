import './ManageMyTeamsMenu.css';
import { Segment, Text, Menu, Provider, Flex, Skeleton } from "@fluentui/react-northstar";
import { OptionsIcon } from '@fluentui/react-icons-northstar';

export function ManageMyTeamsMenu(props: { data: any, localStorageLoading: boolean, getSelectedMenuOption: any }) {
    const { data, localStorageLoading, getSelectedMenuOption } = { ...props }

    const items = [
        {
            key: 'membership',
            content: 'Membership',
        },
        {
            key: 'tags',
            content: 'Tags',
        }
    ]
    const onManageOptionChange = (e: any, data: any) => {
        getSelectedMenuOption(data.content);
    }
    return (
        <>
            <Segment inverted color="brand" className="ManageMenuHeader">
                <Flex gap="gap.small" vAlign="center" >
                    <OptionsIcon />
                    <Text content="Manage" align="center" size="medium" weight="semibold" />
                </Flex>
            </Segment>
            {data && localStorageLoading ?
                <div>
                    <Provider >
                        <Skeleton animation="wave" style={{ marginTop: "1rem" }}>
                            <Skeleton.Line height="3rem" />
                            <Skeleton.Line height="3rem" />
                            <Skeleton.Line height="3rem" />
                        </Skeleton>
                    </Provider>
                </div>
                : data &&
                <div className="ManageMenuContent">
                    <Menu
                        defaultActiveIndex={0}
                        items={items}
                        vertical
                        fluid
                        primary
                        onItemClick={onManageOptionChange}
                        pointing="start"
                    />
                </div>
            }
        </>
    );
}
