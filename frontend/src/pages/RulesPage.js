import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Divider,
  Table,
  TableBody,
  TableRow,
  TableCell,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Gavel as GavelIcon,
  Computer as ComputerIcon,
  MusicNote as MusicIcon,
  Brush as ArtIcon,
  SportsEsports as GameIcon,
  FlashOn as FlashIcon,
  Theaters as WildIcon,
  Description as DocIcon,
  Memory as ChipIcon,
  CheckCircleOutline as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { editionsAPI } from '../services/api';
import MainBar from '../@dpms-freemem/MainBar';
import ThreeBackground from '../components/common/ThreeBackground';
import BackgroundToggle from '../components/common/BackgroundToggle';

const SectionTitle = ({ icon, children }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
    {icon}
    <Typography variant="h6" fontWeight={600}>{children}</Typography>
  </Box>
);

const RuleText = ({ children, sx }) => (
  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, mb: 1.5, ...sx }}>
    {children}
  </Typography>
);

const MachineSpecsTable = ({ title, specs }) => (
  <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
    <Typography variant="subtitle1" fontWeight={600} gutterBottom>{title}</Typography>
    <Table size="small" sx={{ '& td, & th': { border: 0, py: 0.5 } }}>
      <TableBody>
        {specs.map(([label, value]) => (
          <TableRow key={label}>
            <TableCell sx={{ fontWeight: 500, width: 160, pl: 0 }}>{label}</TableCell>
            <TableCell>{value}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Paper>
);

// Map compo names to rule categories
const COMPO_CATEGORY_MAP = {
  'OCS Demo': 'demos',
  'AGA Demo': 'demos',
  'Oldschool Demo': 'demos',
  'PC Demo': 'demos',
  'OCS Intro': 'intros',
  'AGA Intro': 'intros',
  '4K Intro': 'intros',
  '64K Intro': 'intros',
  'OCS Cracktro': 'cracktros',
  'AGA Cracktro': 'cracktros',
  'Bootblock OCS ': 'bootblocks',
  'Bootblock AGA': 'bootblocks',
  'Tracked Music': 'music',
  'Executable Music': 'music',
  'Streaming Music': 'music',
  'OCS Pixel Gfx': 'graphics',
  'AGA Pixel Gfx': 'graphics',
  'Graphics': 'graphics',
  'Pixel Graphics': 'graphics',
  'Photo': 'graphics',
  'ASCII/ANSI': 'graphics',
  'Fast Gfx': 'fast',
  'Fast Music': 'fast',
  'Wild': 'wild',
  'Homebrew games': 'games',
};

const RulesPage = () => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState('general');
  const [editions, setEditions] = useState([]);
  const [selectedEdition, setSelectedEdition] = useState(null);
  const [compos, setCompos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategories, setActiveCategories] = useState(new Set());

  useEffect(() => {
    editionsAPI.list({ public: true })
      .then(res => {
        const list = res.data || [];
        setEditions(list);
        if (list.length > 0) {
          const open = list.find(e => e.open_to_upload);
          setSelectedEdition(open?.id || list[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const fetchCompos = useCallback(async (editionId) => {
    if (!editionId) return;
    try {
      setLoading(true);
      const res = await editionsAPI.getCompos(editionId);
      const compoList = res.data || [];
      setCompos(compoList);

      // Determine which rule categories are relevant
      const cats = new Set();
      compoList.forEach(hc => {
        const cat = COMPO_CATEGORY_MAP[hc.compo_name];
        if (cat) cats.add(cat);
      });
      setActiveCategories(cats);
    } catch (err) {
      setCompos([]);
      setActiveCategories(new Set());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedEdition) fetchCompos(selectedEdition);
  }, [selectedEdition, fetchCompos]);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const has = (category) => activeCategories.has(category);

  // Which compo names are active for a given category
  const compoNamesFor = (category) => {
    return compos
      .filter(hc => COMPO_CATEGORY_MAP[hc.compo_name] === category)
      .map(hc => hc.compo_name);
  };

  // Need OCS machine specs?
  const needsOCS = compos.some(hc => {
    const n = hc.compo_name;
    return n.includes('OCS') || n === 'Oldschool Demo' || n.includes('Bootblock');
  });

  // Need AGA machine specs?
  const needsAGA = compos.some(hc => {
    const n = hc.compo_name;
    return n.includes('AGA') || n === 'Executable Music';
  });

  const ActiveCompoChips = ({ category }) => {
    const names = compoNamesFor(category);
    if (names.length === 0) return null;
    return (
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
        {names.map(name => (
          <Chip key={name} label={name} size="small" color="primary" variant="outlined" />
        ))}
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <ThreeBackground variant="user" />
      <BackgroundToggle />
      <MainBar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, ml: { sm: '64px' }, position: 'relative', zIndex: 1 }}>
        <Box sx={{ maxWidth: 900, mx: 'auto', p: { xs: 1, sm: 3 } }}>

          <Typography variant="h4" gutterBottom fontWeight={700}>
            {t("Competition Rules")}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {t("Rules and specifications for the competitions in the selected edition. Please read carefully before submitting your production.")}
          </Typography>

          {/* Edition selector */}
          {editions.length > 0 && (
            <ToggleButtonGroup
              value={selectedEdition}
              exclusive
              onChange={(e, val) => { if (val !== null) setSelectedEdition(val); }}
              sx={{
                mb: 3,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                '& .MuiToggleButtonGroup-grouped': {
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '20px !important',
                  px: 2,
                  py: 0.75,
                  textTransform: 'none',
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    borderColor: 'primary.main',
                    '&:hover': { bgcolor: 'primary.dark' },
                  },
                },
              }}
            >
              {editions.map((edition) => (
                <ToggleButton key={edition.id} value={edition.id}>
                  {edition.title}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : compos.length === 0 ? (
            <Alert severity="info">
              {t("No competitions configured for this edition yet.")}
            </Alert>
          ) : (
            <>
              {/* Remote participation */}
              <Alert severity="success" sx={{ mb: 3 }}>
                <Typography variant="body2" fontWeight={600}>
                  {t("REMOTE PARTICIPATION IS ALLOWED.")}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t("If a remote production wins a prize, the organization cannot cover shipping costs. The winner may need to arrange pickup through an attendee.")}
                </Typography>
              </Alert>

              {/* NORMAS GENERALES - siempre visible */}
              <Accordion expanded={expanded === 'general'} onChange={handleChange('general')} defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <SectionTitle icon={<GavelIcon color="primary" />}>{t("General Rules")}</SectionTitle>
                </AccordionSummary>
                <AccordionDetails>
                  <RuleText>
                    {t("All entries must be original works created entirely by the participants. In some cases, third-party resources and tools may be used, provided their use has been authorized and properly credited in the production description.")}
                  </RuleText>
                  <RuleText>
                    {t("If AI tools have been used for the production, this must be explicitly stated in the accompanying readme document. In competitions where AI usage is explicitly prohibited, it remains strictly forbidden regardless of disclosure.")}
                  </RuleText>
                  <RuleText>
                    {t("Only works that have not been previously submitted to any other competition will be accepted. Works containing political, religious, racist, sexist, homophobic messages or inciting hatred towards any group will not be accepted.")}
                  </RuleText>
                  <RuleText>
                    {t("Works containing pornography or any audiovisual material deemed inappropriate by the organization for the event audience will not be accepted. Works that violate copyright will not be accepted.")}
                  </RuleText>
                  <RuleText>
                    {t("Submitting a work grants the organization the right to its free distribution through digital means. Disqualified works or those submitted to cancelled competitions will not be distributed.")}
                  </RuleText>
                  <RuleText>
                    {t("Voting will be conducted by a jury. Public voting is not permitted to prevent situations where 'funny or cute' productions (which are still welcome) win over more technically accomplished and higher quality ones.")}
                  </RuleText>
                  <RuleText>
                    {t("The organization reserves the right to disqualify a work as a preventive measure if there are doubts about compliance with any applicable rules.")}
                  </RuleText>

                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    {t("Required Documentation (.txt file)")}
                  </Typography>
                  <RuleText>
                    {t("Each production must be accompanied by a text file (.txt) with the same name containing:")}
                  </RuleText>
                  <List dense>
                    {[
                      t("Full name of the author(s)"),
                      t("Group(s) the authors belong to (if applicable)"),
                      t("Contact email"),
                      t("Competition category (e.g., Wild Compo)"),
                      t("Minimum machine required to run the production (if applicable)"),
                      t("List of all tools used for development"),
                      t("List of third-party resources included with links to their licenses"),
                      t("License texts that need to be included in the distribution"),
                      t("Any additional information of interest (development process, custom tools, etc.)"),
                      t("AI tools used (even partially): which tools and in which parts of the production"),
                    ].map((item, i) => (
                      <ListItem key={i} sx={{ py: 0.25 }}>
                        <ListItemIcon sx={{ minWidth: 28 }}><CheckIcon fontSize="small" color="primary" /></ListItemIcon>
                        <ListItemText primary={item} primaryTypographyProps={{ variant: 'body2' }} />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>

              {/* DEMOS */}
              {has('demos') && (
                <Accordion expanded={expanded === 'demos'} onChange={handleChange('demos')}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <SectionTitle icon={<ComputerIcon color="primary" />}>{t("Demos")}</SectionTitle>
                  </AccordionSummary>
                  <AccordionDetails>
                    <ActiveCompoChips category="demos" />

                    {compoNamesFor('demos').includes('OCS Demo') && (
                      <>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>{t("Demo Amiga OCS")}</Typography>
                        <RuleText>
                          {t("Maximum TWO DISKS (880KB each) or TWO .adf files. Demos, intros and bootblocks are allowed. The first disk must autoboot the production. Machine: A500 kick 1.3 + 512KB expansion.")}
                        </RuleText>
                      </>
                    )}

                    {compoNamesFor('demos').includes('AGA Demo') && (
                      <>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>{t("Demo Amiga AGA")}</Typography>
                        <RuleText>
                          {t("Single compressed archive (preferably .lha or .lzx) with a maximum size of 20MB (20,971,520 bytes). The executable must be in the root directory and easily distinguishable (e.g., with .exe extension). Machine: A1200 + 060 + 64MB RAM.")}
                        </RuleText>
                      </>
                    )}

                    {compoNamesFor('demos').includes('PC Demo') && (
                      <>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>{t("PC Demo")}</Typography>
                        <RuleText>
                          {t("Real-time demo for modern PC platforms. No size limit or hardware restrictions. Audiovisual productions combining effect programming, art and synchronized music.")}
                        </RuleText>
                      </>
                    )}

                    {compoNamesFor('demos').includes('Oldschool Demo') && (
                      <>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>{t("Oldschool Demo")}</Typography>
                        <RuleText>
                          {t("Real-time demo for classic platforms: Amiga, Commodore 64, Atari ST, ZX Spectrum, MSX and other retro machines. The production must run on the original hardware or a cycle-exact emulator.")}
                        </RuleText>
                      </>
                    )}

                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>{t("General Demo Rules")}</Typography>
                    <List dense>
                      {[
                        t("The demo must be submitted as a compressed archive including all files needed for execution. This archive will be the same one distributed later."),
                        t("Productions that cannot run correctly on the competition machine will not be accepted. The machine will be properly restarted before each demo."),
                        t("Productions requiring installation of additional software components will not be accepted, regardless of whether they are included in the distribution archive."),
                        t("Productions must allow stopping execution at any time via right mouse button or Escape key. Trackmo-type demos are exempt from this rule."),
                        t("Maximum duration: 10 minutes including loading times. Longer demos will be interrupted after the time limit."),
                        t("Productions containing viruses, trojans or similar malware will be automatically disqualified."),
                      ].map((item, i) => (
                        <ListItem key={i} sx={{ py: 0.25 }}>
                          <ListItemIcon sx={{ minWidth: 28 }}><InfoIcon fontSize="small" color="action" /></ListItemIcon>
                          <ListItemText primary={item} primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }} />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              )}

              {/* INTROS */}
              {has('intros') && (
                <Accordion expanded={expanded === 'intros'} onChange={handleChange('intros')}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <SectionTitle icon={<ChipIcon color="primary" />}>{t("Intros (64KB / 4KB)")}</SectionTitle>
                  </AccordionSummary>
                  <AccordionDetails>
                    <ActiveCompoChips category="intros" />
                    <RuleText>
                      {t("The intro must be submitted as a single compressed archive containing an executable of maximum 65,536 bytes for the 64KB compo and 4,096 bytes for the 4KB compo. Only the executable will be decompressed.")}
                    </RuleText>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      {compoNamesFor('intros').some(n => n.includes('OCS')) && <Chip label={t("OCS: A500 kick 1.3 + 512KB")} size="small" variant="outlined" />}
                      {compoNamesFor('intros').some(n => n.includes('AGA')) && <Chip label={t("AGA: A1200 + 060 + 64MB RAM")} size="small" variant="outlined" />}
                      <Chip label={t("Max duration: 10 min")} size="small" variant="outlined" />
                    </Box>
                    <RuleText>
                      {t("Same general rules as demos apply: must run correctly on competition machine, no additional software required, must allow stopping via right mouse button or Escape (trackmos exempt), no malware.")}
                    </RuleText>
                  </AccordionDetails>
                </Accordion>
              )}

              {/* CRACKTROS */}
              {has('cracktros') && (
                <Accordion expanded={expanded === 'cracktros'} onChange={handleChange('cracktros')}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <SectionTitle icon={<ComputerIcon color="primary" />}>{t("Cracktros")}</SectionTitle>
                  </AccordionSummary>
                  <AccordionDetails>
                    <ActiveCompoChips category="cracktros" />
                    <RuleText>
                      {t("This is a competition for classic cracktros focused on a single effect while simultaneously showing a logo and a scrolltext.")}
                    </RuleText>
                    <RuleText>
                      {t("Single compressed archive containing an executable of maximum 65,536 bytes (64KB). Only the executable will be decompressed.")}
                    </RuleText>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      {compoNamesFor('cracktros').some(n => n.includes('OCS')) && <Chip label={t("OCS: A500 kick 1.3 + 512KB")} size="small" variant="outlined" />}
                      {compoNamesFor('cracktros').some(n => n.includes('AGA')) && <Chip label={t("AGA: A1200 + 060 + 64MB RAM")} size="small" variant="outlined" />}
                      <Chip label={t("Max duration: 4 min")} size="small" variant="outlined" color="warning" />
                    </Box>
                    <RuleText>
                      {t("Same general rules as demos apply. Productions containing malware will be automatically disqualified.")}
                    </RuleText>
                  </AccordionDetails>
                </Accordion>
              )}

              {/* BOOTBLOCKS */}
              {has('bootblocks') && (
                <Accordion expanded={expanded === 'bootblocks'} onChange={handleChange('bootblocks')}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <SectionTitle icon={<ChipIcon color="primary" />}>{t("Bootblocks (1KB Intros)")}</SectionTitle>
                  </AccordionSummary>
                  <AccordionDetails>
                    <ActiveCompoChips category="bootblocks" />
                    <RuleText>
                      {t("Bootblock intro competition. Single compressed archive containing a bootblock of maximum 1,024 bytes (1KB). Only the executable will be decompressed.")}
                    </RuleText>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      {compoNamesFor('bootblocks').some(n => n.includes('OCS')) && <Chip label={t("OCS: A500 kick 1.3 + 512KB")} size="small" variant="outlined" />}
                      {compoNamesFor('bootblocks').some(n => n.includes('AGA')) && <Chip label={t("AGA: A1200 + 060 + 64MB RAM")} size="small" variant="outlined" />}
                      <Chip label={t("Max duration: 4 min")} size="small" variant="outlined" color="warning" />
                    </Box>
                    <RuleText>
                      {t("In this particular category, it is not required to be able to stop execution or return to the OS. It is recommended to make the demo run on all Amigas even if it's OCS.")}
                    </RuleText>
                  </AccordionDetails>
                </Accordion>
              )}

              {/* MUSIC */}
              {has('music') && (
                <Accordion expanded={expanded === 'music'} onChange={handleChange('music')}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <SectionTitle icon={<MusicIcon color="primary" />}>{t("Music")}</SectionTitle>
                  </AccordionSummary>
                  <AccordionDetails>
                    <ActiveCompoChips category="music" />
                    <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2 }}>
                      {t("Music must be original. Covers and remixes are not allowed.")}
                    </Alert>

                    {compoNamesFor('music').includes('Tracked Music') && (
                      <>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>{t("Tracked Music")}</Typography>
                        <RuleText>
                          {t("Accepted formats: MOD, MED (all versions including SoundStudio), DBM, AHX. Maximum size: 1,900KB.")}
                        </RuleText>
                      </>
                    )}

                    {compoNamesFor('music').includes('Executable Music') && (
                      <>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>{t("Executable Music")}</Typography>
                        <RuleText>
                          {t("Single executable with a maximum size of 32KB (32,768 bytes). No additional files allowed, cannot read from the accompanying .txt file. Freedom to use any tools: AmigaKlang, Pretracker, custom synthesizers, a MOD with p61 embedded in an executable, etc.")}
                        </RuleText>
                        <Chip label={t("Machine: A1200 + 060 + 64MB RAM")} size="small" variant="outlined" sx={{ mb: 1 }} />
                      </>
                    )}

                    {compoNamesFor('music').includes('Streaming Music') && (
                      <>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>{t("Streaming Music")}</Typography>
                        <RuleText>
                          {t("Music in digital audio formats: MP3, OGG, FLAC or similar. No restrictions on production tools or musical style. The piece must be original, covers and remixes are not allowed.")}
                        </RuleText>
                      </>
                    )}
                  </AccordionDetails>
                </Accordion>
              )}

              {/* GRAPHICS */}
              {has('graphics') && (
                <Accordion expanded={expanded === 'graphics'} onChange={handleChange('graphics')}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <SectionTitle icon={<ArtIcon color="primary" />}>{t("Graphics")}</SectionTitle>
                  </AccordionSummary>
                  <AccordionDetails>
                    <ActiveCompoChips category="graphics" />
                    <Alert severity="error" icon={<WarningIcon />} sx={{ mb: 2 }}>
                      {t("AI-generated images are NOT allowed.")}
                    </Alert>
                    <RuleText>
                      {t("Accepted format: IFF. The graphic must include at least 4 work-in-progress steps. Overscan is allowed but full display is not guaranteed. Must be viewable with 1.9MB of free chipmem.")}
                    </RuleText>

                    {compoNamesFor('graphics').includes('OCS Pixel Gfx') && (
                      <>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>{t("Pixel Art OCS")}</Typography>
                        <RuleText>
                          {t("Any resolution supported by Amiga OCS PAL, except HAM modes. In DPaint terms: LoRes, MedRes, HiRes with or without interlace, EHB allowed. No scrolling - parts exceeding screen size will not be shown.")}
                        </RuleText>
                      </>
                    )}

                    {compoNamesFor('graphics').includes('AGA Pixel Gfx') && (
                      <>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>{t("Pixel Art AGA")}</Typography>
                        <RuleText>
                          {t("Any PAL resolution displayable by an Amiga 1200, including Super-hires interlaced, HAM6/8 modes, etc. No scrolling - parts exceeding screen size will not be shown.")}
                        </RuleText>
                      </>
                    )}

                    {compoNamesFor('graphics').includes('Photo') && (
                      <>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>{t("Photography")}</Typography>
                        <RuleText>
                          {t("Works must be original photographs by the author. Digital processing and editing is allowed, but the base must be a real photographic capture, not a generated or illustrated image.")}
                        </RuleText>
                      </>
                    )}
                  </AccordionDetails>
                </Accordion>
              )}

              {/* FAST COMPOS */}
              {has('fast') && (
                <Accordion expanded={expanded === 'fast'} onChange={handleChange('fast')}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <SectionTitle icon={<FlashIcon color="primary" />}>{t("Fast Compos")}</SectionTitle>
                  </AccordionSummary>
                  <AccordionDetails>
                    <ActiveCompoChips category="fast" />
                    <RuleText>
                      {t("The theme will be announced at the party.")}
                    </RuleText>

                    {compoNamesFor('fast').includes('Fast Gfx') && (
                      <>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>{t("Fast Graphics")}</Typography>
                        <RuleText>
                          {t("Maximum resolution: 1920x1080. Must include at least 4 work-in-progress steps. Theme announced at the party.")}
                        </RuleText>
                      </>
                    )}

                    {compoNamesFor('fast').includes('Fast Music') && (
                      <>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>{t("Fast Music")}</Typography>
                        <RuleText>
                          {t("Samples to use and theme will be announced at the party. Accepted module formats will be announced at the party; otherwise, same as the music competition. Maximum duration will be announced at the party.")}
                        </RuleText>
                      </>
                    )}

                    <Alert severity="info" sx={{ mt: 2 }}>
                      {t("If there is popular demand (participants), other fast compos may be organized... AMOS fast compo? Banana compo? If you're interested in a competition not listed, let us know!")}
                    </Alert>
                  </AccordionDetails>
                </Accordion>
              )}

              {/* WILD */}
              {has('wild') && (
                <Accordion expanded={expanded === 'wild'} onChange={handleChange('wild')}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <SectionTitle icon={<WildIcon color="primary" />}>{t("Wild Compo")}</SectionTitle>
                  </AccordionSummary>
                  <AccordionDetails>
                    <RuleText>
                      {t("This category is for all productions that don't fit in other categories. You can submit videos, demos for other platforms, musicdiscs, slideshows, etc.")}
                    </RuleText>
                    <RuleText>
                      {t("Productions for other computers are also accepted, but in that case we would appreciate if you also provide a video and/or bring the computer to run the production. Please notify in advance if possible.")}
                    </RuleText>
                  </AccordionDetails>
                </Accordion>
              )}

              {/* HOMEBREW GAMES */}
              {has('games') && (
                <Accordion expanded={expanded === 'games'} onChange={handleChange('games')}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <SectionTitle icon={<GameIcon color="primary" />}>{t("Homebrew Games")}</SectionTitle>
                  </AccordionSummary>
                  <AccordionDetails>
                    <RuleText>
                      {t("Participants will present their games made for the Amiga platform, either Amiga OCS or AGA. The testing machines will be the same as in the demo competitions.")}
                    </RuleText>
                    <RuleText>
                      {t("Both gamemakers and programming languages are allowed: RedPill, Scorpion Engine, Backbone (with its free update and key), GRAC, AMOS, Blitz Basic, C, ASM, etc.")}
                    </RuleText>
                  </AccordionDetails>
                </Accordion>
              )}

              {/* MACHINE SPECS - solo si hay compos que las necesiten */}
              {(needsOCS || needsAGA) && (
                <Accordion expanded={expanded === 'machines'} onChange={handleChange('machines')}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <SectionTitle icon={<ComputerIcon color="primary" />}>{t("Competition Machine Specifications")}</SectionTitle>
                  </AccordionSummary>
                  <AccordionDetails>
                    {needsOCS && (
                      <MachineSpecsTable
                        title={t("OCS Machine")}
                        specs={[
                          [t('Model'), 'Amiga 500 PAL'],
                          [t('Processor'), 'M68000 / 7.14 MHz'],
                          ['Chipset', 'OCS'],
                          [t('Memory'), '512 KB Chip + 512 KB Slow'],
                          [t('Floppy'), t('Double density (880 KB per disk) / Gotek USB')],
                          [t('Hard drive'), t('Not available')],
                          ['Kickstart', 'v1.3'],
                        ]}
                      />
                    )}
                    {needsAGA && (
                      <MachineSpecsTable
                        title={t("AGA Machine")}
                        specs={[
                          [t('Model'), 'Amiga 1200'],
                          [t('Processor'), 'M68060 / 50 MHz'],
                          ['Chipset', 'AGA'],
                          [t('Memory'), '64 MB Fast'],
                          [t('Hard drive'), t('Available')],
                          ['Kickstart', 'v3.2+'],
                          [t('Pre-installed software'), 'SetPatch, AHI, 68060.library'],
                        ]}
                      />
                    )}
                  </AccordionDetails>
                </Accordion>
              )}

              {/* DELIVERY - siempre visible */}
              <Accordion expanded={expanded === 'delivery'} onChange={handleChange('delivery')}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <SectionTitle icon={<DocIcon color="primary" />}>{t("Submission Requirements")}</SectionTitle>
                </AccordionSummary>
                <AccordionDetails>
                  <RuleText>
                    {t("If the production consists of multiple files (e.g., 2 ADFs, or the image with its work-in-progress steps), they must be packaged together in a compressed archive using a popular format such as LHA, LZX or ZIP.")}
                  </RuleText>
                  <RuleText>
                    {t("Remote participants may optionally provide their Telegram username for faster communication in case of issues or questions.")}
                  </RuleText>
                </AccordionDetails>
              </Accordion>
            </>
          )}

        </Box>
      </Box>
    </Box>
  );
};

export default RulesPage;
