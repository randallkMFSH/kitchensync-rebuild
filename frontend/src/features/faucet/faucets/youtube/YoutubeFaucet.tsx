import { MessageType } from "@common/messages";
import { sendLobbyMessage } from "@data/lobby";
import { FaucetContext } from "@features/faucet/Faucet";
import {
    selectLastPositionUpdateTimestamp,
    selectLastSeekTarget,
    selectShouldBePaused,
} from "@features/faucet/faucetSelectors";
import { FaucetState } from "@features/faucet/FaucetState";
import { selectIsCurrentUserHost } from "@features/memberList/memberListSelectors";
import { selectCurrentMediaObject } from "@features/queue/queueSelectors";
import { useAnimationFrame } from "@util/useAnimationFrame";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Youtube from "react-youtube";
import "./youtubeFaucet.css";

const getIdFromYoutubeURL = (url: string) => {
    return url.match(
        /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/
    )![1];
};

function getDebugNameForPlayerState(state: YT.PlayerState): string {
    switch (state) {
        case YT.PlayerState.UNSTARTED:
            return "UNSTARTED";
        case YT.PlayerState.ENDED:
            return "ENDED";
        case YT.PlayerState.PLAYING:
            return "PLAYING";
        case YT.PlayerState.PAUSED:
            return "PAUSED";
        case YT.PlayerState.BUFFERING:
            return "BUFFERING";
        case YT.PlayerState.CUED:
            return "CUED";
    }
}

const YoutubeController = ({
    playerRef,
    youtubeCallbacksRef,
}: {
    playerRef: React.MutableRefObject<YT.Player | undefined>;
    youtubeCallbacksRef: React.MutableRefObject<YoutubeCallbacks>;
}) => {
    const shouldBePaused = useSelector(selectShouldBePaused);
    const lastSeekTarget = useSelector(selectLastSeekTarget);
    const lastUpdateTime = useSelector(selectLastPositionUpdateTimestamp);
    const FaucetControl = useContext(FaucetContext);
    const isCurrentUserHost = useSelector(selectIsCurrentUserHost);
    const [userInteractionMetadata] = useState({ justSeeked: false });

    const currentMedia = useSelector(selectCurrentMediaObject)!;

    const player = playerRef.current;
    if (!player) {
        return null;
    }

    useEffect(() => {
        console.log("should be paused? ", shouldBePaused, player);
        if (shouldBePaused) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    }, [shouldBePaused]);
    useEffect(() => {
        if (userInteractionMetadata.justSeeked) {
            userInteractionMetadata.justSeeked = false;
            return;
        }
        console.log("lost but seeking");
        player.seekTo(lastSeekTarget, true);
        if (shouldBePaused) {
            player.pauseVideo();
        }
    }, [lastSeekTarget, shouldBePaused]);

    const dispatch = useDispatch();

    useEffect(() => {
        let animationFrameHandle: number;
        let lastFrameTime = player.getCurrentTime();
        const update = () => {
            animationFrameHandle = requestAnimationFrame(update);
            const currentTime = player.getCurrentTime();
            const diff = Math.abs(currentTime - lastFrameTime);
            if (diff > 1.5) {
                userInteractionMetadata.justSeeked = true;
                FaucetControl.seek(currentTime);
                dispatch(FaucetState.actions.seek(currentTime));
            }
            lastFrameTime = currentTime;
        };
        animationFrameHandle = requestAnimationFrame(update);
        return () => cancelAnimationFrame(animationFrameHandle);
    }, [FaucetControl]);

    useAnimationFrame(() => {
        if (shouldBePaused) {
            return;
        }
        if (
            player.getPlayerState() === YT.PlayerState.UNSTARTED ||
            player.getPlayerState() === YT.PlayerState.BUFFERING
        ) {
            return;
        }
        const currentTime = player.getCurrentTime();
        const estimatedCorrectTime = lastSeekTarget + (Date.now() - lastUpdateTime) / 1000;
        const diff = Math.abs(currentTime - estimatedCorrectTime);
        if (diff > 0.5) {
            player.seekTo(estimatedCorrectTime, true);
        }
    }, [shouldBePaused, lastSeekTarget, lastUpdateTime]);

    youtubeCallbacksRef.current.onPlay = () => {
        FaucetControl.play(player.getCurrentTime());
        dispatch(FaucetState.actions.play());
    };

    youtubeCallbacksRef.current.onPause = () => {
        FaucetControl.pause(player.getCurrentTime());
        dispatch(FaucetState.actions.pause());
    };

    youtubeCallbacksRef.current.onStateChange = (state) => {
        console.log(getDebugNameForPlayerState(state));
        switch (state) {
            case YT.PlayerState.ENDED:
                if (isCurrentUserHost) {
                    FaucetControl.ended();
                }
                break;
            case YT.PlayerState.PLAYING:
            case YT.PlayerState.PAUSED:
                if (!isCurrentUserHost) {
                    if (shouldBePaused) {
                        player.pauseVideo();
                    }
                    if (!shouldBePaused) {
                        player.playVideo();
                    }
                }
                break;
            case YT.PlayerState.BUFFERING:
            case YT.PlayerState.CUED:
            case YT.PlayerState.UNSTARTED:
                break;
        }
        if (!currentMedia.duration && isCurrentUserHost) {
            const duration = player.getDuration();
            if (duration) {
                sendLobbyMessage({
                    type: MessageType.SET_MEDIA_DURATION,
                    duration,
                    guid: currentMedia.guid,
                });
            }
        }
    };

    useAnimationFrame(() => {
        switch (player.getPlayerState()) {
            case YT.PlayerState.ENDED:
                break;
            case YT.PlayerState.PLAYING:
                if (!isCurrentUserHost) {
                    if (shouldBePaused) {
                        player.pauseVideo();
                    }
                }
                break;
            case YT.PlayerState.UNSTARTED:
            case YT.PlayerState.PAUSED:
                if (!isCurrentUserHost) {
                    if (!shouldBePaused) {
                        player.playVideo();
                    }
                }
                break;
        }
    }, [shouldBePaused, isCurrentUserHost]);

    useEffect(() => {
        player.loadVideoById(getIdFromYoutubeURL(currentMedia.url), lastSeekTarget);
    }, [currentMedia.url]);

    return null;
};

interface YoutubeCallbacks {
    onPlay: () => void;
    onPause: () => void;
    onStateChange: (state: YT.PlayerState) => void;
}

export const YoutubeFaucet = () => {
    const [isReady, setIsReady] = useState(false);

    const playerRef = useRef<YT.Player>();

    const youtubeCallbacksRef = useRef<YoutubeCallbacks>({
        onPlay() {},
        onPause() {},
        onStateChange() {},
    });

    const onReady = useCallback((event: { target: YT.Player }) => {
        playerRef.current = event.target;
        setIsReady(true);
    }, []);

    const onPlay = useCallback(() => {
        youtubeCallbacksRef.current.onPlay();
    }, []);

    const onPause = useCallback(() => {
        youtubeCallbacksRef.current.onPause();
    }, []);

    const onStateChange = useCallback((event: { data: YT.PlayerState }) => {
        youtubeCallbacksRef.current.onStateChange(event.data);
    }, []);

    return (
        <>
            <Youtube
                onReady={onReady}
                onPlay={onPlay}
                onPause={onPause}
                onStateChange={onStateChange}
                className="youtubeFaucet"
                opts={{
                    playerVars: {
                        playsinline: 1,
                        modestbranding: 1,
                        cc_load_policy: 1,
                        autoplay: 1,
                    },
                }}
            />
            {isReady && <YoutubeController playerRef={playerRef} youtubeCallbacksRef={youtubeCallbacksRef} />}
        </>
    );
};
