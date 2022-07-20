import { useState } from "react";
import "./TeamInfoTileUsers.css";
import { Button, Dialog } from "@fluentui/react-northstar";
import { UserFriendsIcon } from '@fluentui/react-icons-northstar';
import { UsersPortal } from "./UsersPortal";
export function TeamInfoTileUsers(props: { teamData?: any, getIsPopupOpen?: any }) {
    const { teamData, getIsPopupOpen } = { ...props };
    const [isPortal, togglePortal] = useState(false);
    const [execute, setExecute] = useState(false);

    const openPortal = () => {
        togglePortal(true);
        getIsPopupOpen(true);
        setExecute(true);
    }
    const closePortal = () => {
        togglePortal(false);
        getIsPopupOpen(false);
        setExecute(false);
    }
    return (
        <Dialog
            open={isPortal}
            className="UserPortalContainer"
            content={execute
                ? <UsersPortal
                    teamData={teamData}
                    closePortal={closePortal}
                />
                : <></>
            }
            trigger={<Button
                icon={<UserFriendsIcon outline rotate={0} size="large" />}
                text
                iconOnly
                title="Users"
                onClick={openPortal}
            />}
        />
    );
}
