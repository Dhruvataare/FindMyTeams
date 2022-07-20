import { useState } from "react";
import "./TeamInfoTileChannels.css";
import { Button, Dialog, } from "@fluentui/react-northstar";
import { BulletsIcon } from '@fluentui/react-icons-northstar';
import {ChannelsPortal} from "./ChannelsPortal"

export function TeamInfoTileChannels(props: { teamData?: any, getIsPopupOpen?: any }) {
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
            className="ChannelsPortalContainer"
            content={execute
                ? <ChannelsPortal
                    teamData={teamData}
                    closePortal={closePortal}
                />
                : <></>
            }
            trigger={<Button
                icon={<BulletsIcon outline rotate={0} size="large" />}
                text
                iconOnly
                title="Channels"
                onClick={openPortal}
            />}
        />
    );
}
